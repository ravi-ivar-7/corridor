#define _WIN32_WINNT 0x0600
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <wininet.h>
#include <ole2.h>           // For OleInitialize
#include <string>
#include <iostream>
#include <sstream>
#include <iomanip>
#include <cstring>
#include <process.h>       // For _beginthreadex
#include <conio.h>         // For _getch()
#include <time.h>          // For time functions

#pragma comment(lib, "wininet.lib")
#pragma comment(lib, "user32.lib")
#pragma comment(lib, "ole32.lib")
#pragma comment(lib, "oleaut32.lib")

using namespace std;

// Global variables
string lastClipboard = "";
bool ignoreNextUpdate = false;
bool updatingFromServer = false;  // Flag to track server updates
CRITICAL_SECTION cs;  // Critical section for thread safety
bool running = true;  // Global flag to control threads

// Configuration parameters with defaults
string SERVER = "localhost";
int PORT = 443;  // Default HTTPS port
string TOKEN = "";
int POLLING_INTERVAL_MS = 5000;  // Default 5 second
bool DEBUG_MODE = false;  // Default to quiet mode

// Derived values
string API_BASE_PATH = "/api/clipboard";
string FULL_API_PATH = "";

// Always show these messages, regardless of debug mode
void logMessage(const string& message) {
    time_t now;
    time(&now);
    tm* now_tm = localtime(&now);
    
    char time_str[20];
    strftime(time_str, sizeof(time_str), "%H:%M:%S", now_tm);
    cout << "[" << time_str << "] " << message << endl;
}

// Debug logging - only shows in non-quiet mode
void debugLog(const string& message) {
    if (!DEBUG_MODE) return;
    logMessage("[DEBUG] " + message);
}

// Clipboard functions
string getClipboardText() {
    if (!OpenClipboard(nullptr)) {
        debugLog("Error: Failed to open clipboard");
        return "";
    }
    
    EnterCriticalSection(&cs);
    
    if (!IsClipboardFormatAvailable(CF_TEXT)) {
        CloseClipboard();
        return "";
    }
    
    HANDLE hData = GetClipboardData(CF_TEXT);
    if (!hData) {
        CloseClipboard();
        return "";
    }
    
    char* pszText = static_cast<char*>(GlobalLock(hData));
    if (!pszText) {
        CloseClipboard();
        return "";
    }
    
    string text(pszText);
    GlobalUnlock(hData);
    CloseClipboard();
    return text;
}

void setClipboardText(const string& text) {
    debugLog("\n=== Starting setClipboardText ===");
    debugLog("Original text length: " + to_string(text.length()));
    
    if (text.empty()) {
        debugLog("Error: Empty text provided");
        return;
    }

    // Clean up the text - remove any null terminators or special characters
    string cleanText;
    for (char c : text) {
        if (c != '\0' && c != '\r') {
            cleanText += c;
        }
    }
    
    // Ensure the string is not empty after cleaning
    if (cleanText.empty()) {
        debugLog("Error: Text is empty after cleaning");
        return;
    }
    
    debugLog("Cleaned text length: " + to_string(cleanText.length()));

    // Initialize COM for clipboard
    if (FAILED(OleInitialize(NULL))) {
        debugLog("Error: Failed to initialize COM");
        return;
    }

    // Try to open the clipboard (with retry logic)
    int attempts = 0;
    const int maxAttempts = 5;
    bool clipboardOpened = false;
    
    while (attempts < maxAttempts && !(clipboardOpened = OpenClipboard(NULL))) {
        DWORD error = GetLastError();
        debugLog("Attempt " + to_string(attempts + 1) + " - Failed to open clipboard. Error: " + to_string(error));
        Sleep(100); // Wait 100ms before retrying
        attempts++;
    }
    
    if (!clipboardOpened) {
        debugLog("Error: Failed to open clipboard after " + to_string(maxAttempts) + " attempts");
        OleUninitialize();
        return;
    }
    debugLog("1. Opened clipboard successfully");

    // Empty the clipboard
    if (!EmptyClipboard()) {
        DWORD error = GetLastError();
        debugLog("Error: Failed to empty clipboard. Error: " + to_string(error));
        CloseClipboard();
        OleUninitialize();
        return;
    }
    debugLog("2. Emptied clipboard");

    // Allocate global memory for the text
    size_t bufferSize = cleanText.length() + 1; // +1 for null terminator
    HGLOBAL hMem = GlobalAlloc(GMEM_MOVEABLE | GMEM_ZEROINIT, bufferSize);
    if (!hMem) {
        debugLog("Error: Failed to allocate memory. Error: " + to_string(GetLastError()));
        CloseClipboard();
        OleUninitialize();
        return;
    }
    debugLog("3. Allocated " + to_string(bufferSize) + " bytes of memory");

    // Lock the memory and copy the text
    char* pMem = static_cast<char*>(GlobalLock(hMem));
    if (!pMem) {
        debugLog("Error: Failed to lock memory. Error: " + to_string(GetLastError()));
        GlobalFree(hMem);
        CloseClipboard();
        OleUninitialize();
        return;
    }
    
    // Copy the cleaned text to the global memory
    strncpy(pMem, cleanText.c_str(), cleanText.length());
    pMem[cleanText.length()] = '\0'; // Ensure null termination
    
    GlobalUnlock(hMem);
    debugLog("4. Copied text to memory");

    // Set the clipboard data
    if (!SetClipboardData(CF_TEXT, hMem)) {
        DWORD error = GetLastError();
        debugLog("Error: Failed to set clipboard data. Error: " + to_string(error));
        GlobalFree(hMem);
    } else {
        debugLog("5. Successfully set clipboard data");
        // The system now owns the memory, don't free it
        
        // Verify the clipboard content
        if (IsClipboardFormatAvailable(CF_TEXT)) {
            HANDLE hData = GetClipboardData(CF_TEXT);
            if (hData) {
                char* pData = static_cast<char*>(GlobalLock(hData));
                if (pData) {
                    debugLog("6. Clipboard verification - Content length: " + to_string(strlen(pData)));
                    debugLog("First 50 chars: " + string(pData).substr(0, 50));
                    GlobalUnlock(hData);
                }
            }
        }
    }

    // Clean up
    CloseClipboard();
    OleUninitialize();
    debugLog("=== Clipboard update completed ===");
}

// Build the full API URL with token
void buildApiPath() {
    ostringstream oss;
    oss << API_BASE_PATH << "/" << TOKEN;
    FULL_API_PATH = oss.str();    
    debugLog("API Endpoint: http://" + SERVER + ":" + to_string(PORT) + FULL_API_PATH);
}

// HTTP functions
string httpRequest(const string& method, const string& path, const string& body = "") {
    string protocol = (PORT == 443) ? "https://" : "http://";
    string fullUrl = protocol + SERVER + ":" + to_string(PORT) + path;
    debugLog(string("HTTP ") + method + " request to: " + fullUrl);
    
    // Initialize WinINet
    HINTERNET hInternet = InternetOpenA("ClipboardSync/1.0", 
                                      INTERNET_OPEN_TYPE_DIRECT, 
                                      NULL, 
                                      NULL, 
                                      0);
    if (!hInternet) {
        DWORD error = GetLastError();
        logMessage("Error: InternetOpenA failed with error: " + to_string(error));
        return "";
    }

    // Set timeouts (15 seconds for connection, 30 seconds for send/receive)
    DWORD timeout = 15000; // 15 seconds
    InternetSetOptionA(hInternet, INTERNET_OPTION_CONNECT_TIMEOUT, &timeout, sizeof(timeout));
    timeout = 30000; // 30 seconds
    InternetSetOptionA(hInternet, INTERNET_OPTION_RECEIVE_TIMEOUT, &timeout, sizeof(timeout));
    InternetSetOptionA(hInternet, INTERNET_OPTION_SEND_TIMEOUT, &timeout, sizeof(timeout));

    // Connect to server
    HINTERNET hConnect = InternetConnectA(hInternet, 
                                        SERVER.c_str(), 
                                        PORT, 
                                        NULL, 
                                        NULL, 
                                        INTERNET_SERVICE_HTTP, 
                                        0, 
                                        0);
    if (!hConnect) {
        DWORD error = GetLastError();
        logMessage("Error: Failed to connect to server: " + to_string(error));
        InternetCloseHandle(hInternet);
        return "";
    }

    // Create request
    const char* acceptTypes[] = {"application/json", "*/*", NULL};
    DWORD flags = INTERNET_FLAG_RELOAD | INTERNET_FLAG_NO_CACHE_WRITE | 
                 INTERNET_FLAG_KEEP_CONNECTION;
    
    if (PORT == 443) {
        flags |= INTERNET_FLAG_SECURE;
    }

    HINTERNET hRequest = HttpOpenRequestA(hConnect, 
                                         method.c_str(), 
                                         path.c_str(), 
                                         NULL, 
                                         NULL, 
                                         acceptTypes, 
                                         flags, 
                                         0);
    if (!hRequest) {
        DWORD error = GetLastError();
        logMessage("Error: HttpOpenRequest failed: " + to_string(error));
        InternetCloseHandle(hConnect);
        InternetCloseHandle(hInternet);
        return "";
    }

    // Add headers
    string headers = "Content-Type: application/json\r\n";
    if (!HttpAddRequestHeadersA(hRequest, headers.c_str(), headers.length(), 
                              HTTP_ADDREQ_FLAG_ADD | HTTP_ADDREQ_FLAG_REPLACE)) {
        DWORD error = GetLastError();
        debugLog("Warning: Failed to add request headers: " + to_string(error));
    }

    // Send request
    BOOL requestSent = HttpSendRequestA(hRequest, 
                                      NULL,  // Additional headers (already set)
                                      0,     // Headers length
                                      body.empty() ? NULL : (LPVOID)body.c_str(), 
                                      body.length());
    
    if (!requestSent) {
        DWORD error = GetLastError();
        logMessage("Error: HTTP request failed with error: " + to_string(error));
        InternetCloseHandle(hRequest);
        InternetCloseHandle(hConnect);
        InternetCloseHandle(hInternet);
        return "";
    }

    // Check HTTP status code
    DWORD statusCode = 0;
    DWORD statusCodeSize = sizeof(statusCode);
    if (!HttpQueryInfoA(hRequest, 
                       HTTP_QUERY_STATUS_CODE | HTTP_QUERY_FLAG_NUMBER, 
                       &statusCode, 
                       &statusCodeSize, 
                       NULL)) {
        DWORD error = GetLastError();
        debugLog("Warning: Failed to get HTTP status code: " + to_string(error));
    } else if (statusCode < 200 || statusCode >= 300) {
        logMessage("Error: Server returned HTTP status code: " + to_string(statusCode));
        InternetCloseHandle(hRequest);
        InternetCloseHandle(hConnect);
        InternetCloseHandle(hInternet);
        return "";
    }

    // Read response
    string response;
    const DWORD BUFFER_SIZE = 4096;
    char buffer[BUFFER_SIZE];
    DWORD bytesRead = 0;
    
    while (true) {
        if (!InternetReadFile(hRequest, buffer, BUFFER_SIZE - 1, &bytesRead)) {
            DWORD error = GetLastError();
            logMessage("Error reading response: " + to_string(error));
            break;
        }
        
        if (bytesRead == 0) {
            break; // End of response
        }
        
        buffer[bytesRead] = '\0';
        response.append(buffer, bytesRead);
    }
    
    debugLog("HTTP " + to_string(statusCode) + " - Response length: " + to_string(response.length()));

    // Clean up
    InternetCloseHandle(hRequest);
    InternetCloseHandle(hConnect);
    InternetCloseHandle(hInternet);

    return response;
}

// Simple JSON unescape
string unescapeJsonString(const string& input) {
    string output;
    for (size_t i = 0; i < input.length(); i++) {
        if (input[i] == '\\' && i + 1 < input.length()) {
            if (input[i+1] == 'n') { output += '\n'; i++; }
            else if (input[i+1] == 'r') { output += '\r'; i++; }
            else if (input[i+1] == 't') { output += '\t'; i++; }
            else if (input[i+1] == '"') { output += '"'; i++; }
            else if (input[i+1] == '\\') { output += '\\'; i++; }
            else { output += input[i]; }
        } else {
            output += input[i];
        }
    }
    return output;
}

// Thread function to monitor local clipboard changes
unsigned __stdcall clipboardThread(void* param) {
    (void)param;
    string lastLocalClipboard = getClipboardText();
    
    while (running) {
        string currentClipboard = getClipboardText();
        
        if (!currentClipboard.empty() && currentClipboard != lastLocalClipboard && !updatingFromServer) {
            debugLog("Local clipboard changed: " + currentClipboard);
            
            // Update last clipboard to prevent duplicate updates
            lastLocalClipboard = currentClipboard;
            lastClipboard = currentClipboard;
            
            // Send to server
            debugLog("Local change detected, sending to server...");
            
            // Build JSON body with proper escaping
            string jsonBody = "{\"content\":\"";
            for (char c : currentClipboard) {
                // Handle special characters in JSON
                switch (c) {
                    case '\\': jsonBody += "\\\\"; break;
                    case '"':  jsonBody += "\\\""; break;
                    case '/':  jsonBody += "\\/"; break;
                    case '\b': jsonBody += "\\b"; break;
                    case '\f': jsonBody += "\\f"; break;
                    case '\n': jsonBody += "\\n"; break;
                    case '\r': jsonBody += "\\r"; break;
                    case '\t': jsonBody += "\\t"; break;
                    default:
                        // Escape control characters
                        if (c < ' ') {
                            char buf[10];
                            snprintf(buf, sizeof(buf), "\\u%04x", (unsigned char)c);
                            jsonBody += buf;
                        } else {
                            jsonBody += c;
                        }
                }
            }
            jsonBody += "\"}";
            
            debugLog("Sending to server: " + jsonBody);
            
            // Send to server with retry logic
            bool success = false;
            int retryCount = 0;
            const int maxRetries = 3;
            
            while (!success && retryCount < maxRetries) {
                string response = httpRequest("POST", FULL_API_PATH, jsonBody);
                
                if (!response.empty()) {
                    debugLog("Successfully updated server");
                    success = true;
                } else {
                    retryCount++;
                    if (retryCount < maxRetries) {
                        debugLog("Failed to update server, retrying (" + to_string(retryCount) + "/" + to_string(maxRetries) + ")");
                        Sleep(1000); // Wait 1 second before retry
                    } else {
                        logMessage("Error: Failed to update server after " + to_string(maxRetries) + " attempts");
                    }
                }
            }
        }
        
        Sleep(100); // Check every 100ms
    }
    return 0;
}

// Server polling thread
unsigned __stdcall serverThread(void* param) {
    (void)param;
    while (running) {
        try {
            string response = httpRequest("GET", FULL_API_PATH);
            if (response.empty() || response == "{}") {
                Sleep(1000);
                continue;
            }
            
            // Simple JSON parsing
            debugLog("Server response: " + response);
            size_t content_pos = response.find("content\":\"");
            if (content_pos == string::npos) {
                debugLog("Invalid server response format - missing content field");
                Sleep(1000);
                continue;
            }
            
            size_t start = content_pos + 10; // Length of "content\":\""
            size_t end = response.find('"', start); // Find the closing quote
            
            if (end == string::npos) {
                debugLog("Invalid content format - missing closing quote");
                Sleep(1000);
                continue;
            }
            
            string content = response.substr(start, end - start);
            debugLog("Extracted content before unescape: " + content);
            content = unescapeJsonString(content);
            debugLog("After unescaping: " + content);
            
            if (!content.empty() && content != lastClipboard) {
                debugLog("Server has new content, updating clipboard...");
                updatingFromServer = true;
                
                // Update clipboard
                setClipboardText(content);
                lastClipboard = content;
                
                updatingFromServer = false;
                debugLog("Clipboard updated from server");
            }
        } catch (const exception& e) {
            debugLog(string("Server error: ") + e.what());
        }
        
        Sleep(POLLING_INTERVAL_MS); // Use configured polling interval
    }
}

void showUsage(const char* programName) {
    cout << "Usage: " << programName << " [options]" << endl;
    cout << "Options:" << endl;
    cout << "  -h, --host <hostname>   Server hostname or IP (default: localhost)" << endl;
    cout << "  -p, --port <port>       Server port (default: 443 for HTTPS)" << endl;
    cout << "  -t, --token <token>     Authentication token (required)" << endl;
    cout << "  -i, --interval <ms>     Polling interval in milliseconds (default: 1000)" << endl;
    cout << "  -q, --quiet             Disable debug output" << endl;
    cout << "  --help                  Show this help message" << endl;
}

int main(int argc, char* argv[]) {
    // Parse command line arguments
    for (int i = 1; i < argc; i++) {
        string arg = argv[i];
        if (arg == "-h" || arg == "--host") {
            if (i + 1 < argc) {
                SERVER = argv[++i];
            }
        } else if (arg == "-p" || arg == "--port") {
            if (i + 1 < argc) {
                PORT = stoi(argv[++i]);
            }
        } else if (arg == "-t" || arg == "--token") {
            if (i + 1 < argc) {
                TOKEN = argv[++i];
            }
        } else if (arg == "-i" || arg == "--interval") {
            if (i + 1 < argc) {
                POLLING_INTERVAL_MS = stoi(argv[++i]);
            }
        } else if (arg == "-q" || arg == "--quiet") {
            DEBUG_MODE = false;
        } else if (arg == "--help") {
            showUsage(argv[0]);
            return 0;
        }
    }

    // Validate required parameters
    if (TOKEN.empty()) {
        logMessage("Error: Token is required. Use --help for usage information.");
        return 1;
    }

    // Build the API path with token
    buildApiPath();
    logMessage("Clipboard Sync Client Started");
    if (DEBUG_MODE) {
        debugLog("Server: " + SERVER + ":" + to_string(PORT));
        debugLog("Token: " + TOKEN);
        debugLog("Polling Interval: " + to_string(POLLING_INTERVAL_MS) + "ms");
    }
    
    // Initialize critical section
    InitializeCriticalSection(&cs);
    
    // Initialize COM for clipboard operations
    if (FAILED(CoInitializeEx(NULL, COINIT_APARTMENTTHREADED | COINIT_DISABLE_OLE1DDE))) {
        debugLog("Error: Failed to initialize COM");
        return 1;
    }
    
    // Create threads
    HANDLE hThreads[2];
    hThreads[0] = (HANDLE)_beginthreadex(NULL, 0, &clipboardThread, NULL, 0, NULL);
    hThreads[1] = (HANDLE)_beginthreadex(NULL, 0, &serverThread, NULL, 0, NULL);
    
    if (!hThreads[0] || !hThreads[1]) {
        debugLog("Error: Failed to create threads");
        return 1;
    }
    
    // Wait for a key press to exit
    debugLog("Press any key to exit...");
    _getch();
    
    // Signal threads to exit
    running = false;
    
    // Wait for threads to finish
    WaitForMultipleObjects(2, hThreads, TRUE, INFINITE);
    
    // Cleanup
    CloseHandle(hThreads[0]);
    CloseHandle(hThreads[1]);
    DeleteCriticalSection(&cs);
    CoUninitialize();
    
    debugLog("Clipboard Sync Client Exiting...");
    return 0;
}