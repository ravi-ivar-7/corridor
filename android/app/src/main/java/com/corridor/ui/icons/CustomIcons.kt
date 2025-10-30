package com.corridor.ui.icons

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.materialIcon
import androidx.compose.material.icons.materialPath
import androidx.compose.ui.graphics.vector.ImageVector

/**
 * Custom Lucide-style minimalist icons for Corridor
 */
object CustomIcons {

    val CircleCheck: ImageVector
        get() = materialIcon(name = "Filled.CircleCheck") {
            materialPath {
                moveTo(12f, 2f)
                curveTo(6.48f, 2f, 2f, 6.48f, 2f, 12f)
                reflectiveCurveToRelative(4.48f, 10f, 10f, 10f)
                reflectiveCurveToRelative(10f, -4.48f, 10f, -10f)
                reflectiveCurveTo(17.52f, 2f, 12f, 2f)
                close()
                moveTo(10f, 17f)
                lineToRelative(-5f, -5f)
                lineToRelative(1.41f, -1.41f)
                lineTo(10f, 14.17f)
                lineToRelative(7.59f, -7.59f)
                lineTo(19f, 8f)
                lineToRelative(-9f, 9f)
                close()
            }
        }

    val CircleX: ImageVector
        get() = materialIcon(name = "Filled.CircleX") {
            materialPath {
                moveTo(12f, 2f)
                curveTo(6.48f, 2f, 2f, 6.48f, 2f, 12f)
                reflectiveCurveToRelative(4.48f, 10f, 10f, 10f)
                reflectiveCurveToRelative(10f, -4.48f, 10f, -10f)
                reflectiveCurveTo(17.52f, 2f, 12f, 2f)
                close()
                moveTo(15.59f, 14.41f)
                lineTo(14.41f, 15.59f)
                lineTo(12f, 13.17f)
                lineToRelative(-2.41f, 2.42f)
                lineToRelative(-1.18f, -1.18f)
                lineTo(10.83f, 12f)
                lineToRelative(-2.42f, -2.41f)
                lineToRelative(1.18f, -1.18f)
                lineTo(12f, 10.83f)
                lineToRelative(2.41f, -2.42f)
                lineToRelative(1.18f, 1.18f)
                lineTo(13.17f, 12f)
                lineToRelative(2.42f, 2.41f)
                close()
            }
        }

    val CircleDot: ImageVector
        get() = materialIcon(name = "Filled.CircleDot") {
            materialPath {
                moveTo(12f, 2f)
                curveTo(6.48f, 2f, 2f, 6.48f, 2f, 12f)
                reflectiveCurveToRelative(4.48f, 10f, 10f, 10f)
                reflectiveCurveToRelative(10f, -4.48f, 10f, -10f)
                reflectiveCurveTo(17.52f, 2f, 12f, 2f)
                close()
                moveTo(12f, 16f)
                curveToRelative(-2.21f, 0f, -4f, -1.79f, -4f, -4f)
                reflectiveCurveToRelative(1.79f, -4f, 4f, -4f)
                reflectiveCurveToRelative(4f, 1.79f, 4f, 4f)
                reflectiveCurveToRelative(-1.79f, 4f, -4f, 4f)
                close()
            }
        }

    val Eye: ImageVector
        get() = materialIcon(name = "Outlined.Eye") {
            materialPath {
                moveTo(12f, 4.5f)
                curveTo(7f, 4.5f, 2.73f, 7.61f, 1f, 12f)
                curveToRelative(1.73f, 4.39f, 6f, 7.5f, 11f, 7.5f)
                reflectiveCurveToRelative(9.27f, -3.11f, 11f, -7.5f)
                curveToRelative(-1.73f, -4.39f, -6f, -7.5f, -11f, -7.5f)
                close()
                moveTo(12f, 17f)
                curveToRelative(-2.76f, 0f, -5f, -2.24f, -5f, -5f)
                reflectiveCurveToRelative(2.24f, -5f, 5f, -5f)
                reflectiveCurveToRelative(5f, 2.24f, 5f, 5f)
                reflectiveCurveToRelative(-2.24f, 5f, -5f, 5f)
                close()
                moveTo(12f, 9f)
                curveToRelative(-1.66f, 0f, -3f, 1.34f, -3f, 3f)
                reflectiveCurveToRelative(1.34f, 3f, 3f, 3f)
                reflectiveCurveToRelative(3f, -1.34f, 3f, -3f)
                reflectiveCurveToRelative(-1.34f, -3f, -3f, -3f)
                close()
            }
        }

    val EyeOff: ImageVector
        get() = materialIcon(name = "Outlined.EyeOff") {
            materialPath {
                moveTo(12f, 7f)
                curveToRelative(2.76f, 0f, 5f, 2.24f, 5f, 5f)
                curveToRelative(0f, 0.65f, -0.13f, 1.26f, -0.36f, 1.83f)
                lineToRelative(2.92f, 2.92f)
                curveToRelative(1.51f, -1.26f, 2.7f, -2.89f, 3.43f, -4.75f)
                curveToRelative(-1.73f, -4.39f, -6f, -7.5f, -11f, -7.5f)
                curveToRelative(-1.4f, 0f, -2.74f, 0.25f, -3.98f, 0.7f)
                lineToRelative(2.16f, 2.16f)
                curveTo(10.74f, 7.13f, 11.35f, 7f, 12f, 7f)
                close()
                moveTo(2f, 4.27f)
                lineToRelative(2.28f, 2.28f)
                lineToRelative(0.46f, 0.46f)
                curveTo(3.08f, 8.3f, 1.78f, 10.02f, 1f, 12f)
                curveToRelative(1.73f, 4.39f, 6f, 7.5f, 11f, 7.5f)
                curveToRelative(1.55f, 0f, 3.03f, -0.3f, 4.38f, -0.84f)
                lineToRelative(0.42f, 0.42f)
                lineTo(19.73f, 22f)
                lineTo(21f, 20.73f)
                lineTo(3.27f, 3f)
                lineTo(2f, 4.27f)
                close()
                moveTo(7.53f, 9.8f)
                lineToRelative(1.55f, 1.55f)
                curveToRelative(-0.05f, 0.21f, -0.08f, 0.43f, -0.08f, 0.65f)
                curveToRelative(0f, 1.66f, 1.34f, 3f, 3f, 3f)
                curveToRelative(0.22f, 0f, 0.44f, -0.03f, 0.65f, -0.08f)
                lineToRelative(1.55f, 1.55f)
                curveToRelative(-0.67f, 0.33f, -1.41f, 0.53f, -2.2f, 0.53f)
                curveToRelative(-2.76f, 0f, -5f, -2.24f, -5f, -5f)
                curveToRelative(0f, -0.79f, 0.2f, -1.53f, 0.53f, -2.2f)
                close()
                moveTo(11.84f, 9.02f)
                lineToRelative(3.15f, 3.15f)
                lineToRelative(0.02f, -0.16f)
                curveToRelative(0f, -1.66f, -1.34f, -3f, -3f, -3f)
                lineToRelative(-0.17f, 0.01f)
                close()
            }
        }

    val Wifi: ImageVector
        get() = materialIcon(name = "Outlined.Wifi") {
            materialPath {
                moveTo(1f, 9f)
                lineToRelative(2f, 2f)
                curveToRelative(4.97f, -4.97f, 13.03f, -4.97f, 18f, 0f)
                lineToRelative(2f, -2f)
                curveTo(16.93f, 2.93f, 7.08f, 2.93f, 1f, 9f)
                close()
                moveTo(9f, 17f)
                lineToRelative(3f, 3f)
                lineToRelative(3f, -3f)
                curveToRelative(-1.65f, -1.66f, -4.34f, -1.66f, -6f, 0f)
                close()
                moveTo(5f, 13f)
                lineToRelative(2f, 2f)
                curveToRelative(2.76f, -2.76f, 7.24f, -2.76f, 10f, 0f)
                lineToRelative(2f, -2f)
                curveTo(15.14f, 9.14f, 8.87f, 9.14f, 5f, 13f)
                close()
            }
        }

    val WifiOff: ImageVector
        get() = materialIcon(name = "Outlined.WifiOff") {
            materialPath {
                moveTo(23.64f, 7f)
                curveToRelative(-0.45f, -0.34f, -4.93f, -4f, -11.64f, -4f)
                curveToRelative(-1.5f, 0f, -2.89f, 0.19f, -4.15f, 0.48f)
                lineTo(10.58f, 6.3f)
                curveTo(10.74f, 6.29f, 10.89f, 6.29f, 11.05f, 6.28f)
                curveTo(14.89f, 6.15f, 18.56f, 7.58f, 21.46f, 10.09f)
                lineTo(23.64f, 7f)
                close()
                moveTo(3.41f, 1.86f)
                lineTo(2f, 3.27f)
                lineToRelative(2.05f, 2.05f)
                curveTo(1.91f, 6.76f, 0.59f, 8.29f, 0.36f, 8.5f)
                lineTo(2.5f, 11.5f)
                curveTo(3.55f, 10.3f, 6.64f, 7.03f, 11.03f, 7.03f)
                curveToRelative(0.81f, 0f, 1.59f, 0.08f, 2.33f, 0.21f)
                lineToRelative(3.4f, 3.4f)
                curveToRelative(-1.31f, -0.44f, -2.74f, -0.69f, -4.23f, -0.69f)
                curveToRelative(-2.5f, 0f, -4.79f, 0.83f, -6.64f, 2.23f)
                lineTo(7.5f, 15.5f)
                lineToRelative(4.5f, 4.5f)
                lineToRelative(2.68f, -2.68f)
                lineToRelative(5.84f, 5.84f)
                lineToRelative(1.41f, -1.41f)
                lineTo(3.41f, 1.86f)
                close()
            }
        }
}
