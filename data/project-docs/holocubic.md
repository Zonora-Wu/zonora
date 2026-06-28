# HoloCubic · 全息小电视

> 基于 ESP32-PICO-D4 的开源桌面小电视 — 从元器件采购、PCB 打样、外壳定制到固件二次开发全链路实践

## 0. 关于本项目

如视频所述，本项目有意思的地方在于使用了一个分光棱镜来设计出**伪全息显示**的效果。这个小设备功能丰富，搭载 WiFi 和蓝牙能力，可以实现多种网络应用。

本项目的硬件方案是基于 **ESP32-PICO-D4** 的（乐鑫 SiP 封装芯片，PCBA 仅硬币大小），软件方面基于 **LVGL GUI 库**，移植了 ST7789 1.3 寸 240×240 分辨率屏幕驱动，将 MPU6050 作为输入设备通过感应模拟编码器键值交互。

视频介绍：https://www.bilibili.com/video/BV1VA411p7MD/

## 1. 硬件打样说明

### PCB 版本

`Hardware` 文件包含两个版本的 PCB 电路：

- **Naive Version**：板载 ESP32、IMU、环境光传感器、SD 卡槽、下载电路、以及两个 RGB 灯
- **Ironman Version**：删去环境光传感器，修改 PCB 形状适配新外壳

两层板，整板成本在 **50 元以内**。

### 外壳加工

`3D Model` 文件夹包含四种版本的外壳：

- **Naive Version**：简约设计，光固化 3D 打印
- **Bilibili Version**：B 站百大奖杯造型，娱乐性质
- **Metal Version**：优化布局，CNC 金属加工
- **Ironman Version**：野生钢铁侠风格，与合作朋友联名量产（[Xikii](https://shop68240117.taobao.com)）

## 2. 固件编译说明

固件框架基于 **Arduino** 开发，需安装 ESP32 Arduino 支持包。

**关键修改**：ESP32 官方库 `SPI/src/SPI.cpp` 中 MISO 引脚需改为 **26**（因 HSPI 默认 MISO 引脚 12 是 Flash 上电电平设置引脚，上拉会导致芯片无法启动）。

```cpp
// esp32/hardware/esp32/1.0.4/libraries/SPI/src/SPI.cpp
_miso = (_spi_num == VSPI) ? MISO : 12; // 改为 26
```

> 也可通过设置芯片熔丝解决（一次性不可逆）。

## 3. Visual Studio 模拟器 & 图片转换脚本

- **VS 模拟器**：`Software` 文件夹包含 VS 工程，可本地模拟 LVGL 界面效果，改完直接粘贴到 Arduino 固件，无需每次交叉编译
- **图片转换脚本**：`ImageToHolo` 文件夹提供 Python 脚本用于批量将图片转为 HoloCubic 固件用的 `.bin` 资源
  - LVGL 官方在线工具每次只能转换一张
  - 本脚本参考 [W-Mai/lvgl_image_converter](https://github.com/W-Mai/lvgl_image_converter)
  - 资源存储在 SD 卡（FAT 文件系统），ESP32 Flash 有限

**图片资源使用方式（SD 卡路径）：**

```cpp
lv_obj_t* imgbtn = lv_imgbtn_create(lv_scr_act(), NULL);
lv_imgbtn_set_src(imgbtn, LV_BTN_STATE_PRESSED, "S:/dir/icon_pressed.bin");
lv_imgbtn_set_src(imgbtn, LV_BTN_STATE_RELEASED, "S:/dir/icon_released.bin");
```

> 也可使用预编译 exe 转换器（拖拽即可批量转换 `.jpg/png/bmp` → `.bin`）

## 4. 分光棱镜

- 规格：25.4mm × 25.4mm × 25.4mm，淘宝约 80 元/个
- 固定方式：建议用 **OCA 胶**（全贴合屏幕工艺固态胶），避免普通胶水渗入屏幕水印
- 操作注意：OCA 粘性极强，留气泡后难取下

## 项目结构

```text
├── Hardware/             # PCB 电路文件（Naive / Ironman）
├── Firmware/             # Arduino 固件源码
│   └── Libraries/        # LVGL 等库文件
├── Software/             # VS 模拟器工程
├── ImageToHolo/          # 图片批量转换脚本
├── 3D Model/             # 外壳模型（4 种版本）
└── Documents/            # 文档资料
```

## 技术栈

| 模块 | 技术 |
|------|------|
| MCU | ESP32-PICO-D4（SiP 封装，硬币大小） |
| GUI 框架 | LVGL |
| 开发语言 | C++ / Arduino |
| 通信 | WiFi + Bluetooth |
| 屏幕 | ST7789 1.3" 240×240 |
| 传感器 | MPU6050（IMU）+ 环境光 |
| 存储 | SD 卡（FAT 文件系统） |
| 显示原理 | 分光棱镜伪全息 |

## 许可证

MIT
