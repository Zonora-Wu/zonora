---
title: RTX 5070 12GB 本地跑大模型实测：接入 Claude Code 与 Hermes Agent
date: 2026-06-21
excerpt: 实测 llama.exe、Ollama、LM Studio，并接入 Claude Code 与 Hermes Agent 的本地大模型工作流。
---

# RTX 5070 12GB + 32GB 内存本地跑大模型实测：llama.exe、Ollama、LM Studio 接入 Claude Code 与 Hermes Agent

## 前言

最近我用一台 **RTX 5070 12GB 显存 + 32GB 内存** 的机器，集中测试了一批本地大语言模型。测试目标很明确：不是单纯看模型能不能加载，也不是只看聊天窗口里回答得顺不顺，而是看它们能不能真正接入我的本地工作流。

我的主要使用场景是：

- Windows 侧运行本地模型服务；
- WSL 里使用 Claude Code；
- 同时接入 Hermes Agent；
- 通过 cc Switch 在不同模型后端之间切换；
- 测试 llama.exe、Ollama、LM Studio 三种本地模型运行方式；
- 对比多个 Qwen3.6、Gemma 4 量化模型在速度、稳定性和 Agent 场景下的表现。

最后结论比较明确：

> **第一推荐：Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-Q4_K_M，速度大约 30 tokens/s。**
>
> **第二推荐：gemma-4-26B-A4B-it-UD-Q4_K_M，速度大约 22 tokens/s。**

如果只是普通聊天，很多模型都能“看起来能用”。但如果接入 Claude Code、Hermes Agent，让模型读项目、改代码、规划任务、执行多轮指令，差距会非常明显。

---

## 一、硬件环境与整体架构

我的测试环境如下：

| 项目 | 配置 |
|---|---|
| GPU | RTX 5070 12GB |
| 内存 | 32GB |
| 系统 | Windows + WSL |
| 模型格式 | GGUF 为主 |
| 推理工具 | llama.exe / Ollama / LM Studio |
| Agent 工具 | Claude Code / Hermes Agent |
| 中转工具 | cc Switch |
| 主要用途 | 本地代码助手、本地 Agent、本地模型调试 |

整体链路大概是这样：

```text
Windows 本地模型服务
llama.exe / Ollama / LM Studio
        ↓
OpenAI-compatible API
        ↓
cc Switch
        ↓
WSL
        ↓
Claude Code / Hermes Agent
```

这样做的好处是，模型服务继续跑在 Windows 上，直接吃 NVIDIA 显卡；开发环境、项目目录、命令行工具和 Agent 留在 WSL 中。两边分工清晰，不需要把所有东西都塞进 WSL，也不需要把开发项目迁回 Windows。

---

## 二、为什么 12GB 显存也可以尝试 35B MoE 模型

很多人看到 12GB 显存，第一反应是只能跑 7B、8B、14B 级别模型。这个判断在稠密模型上大体没错，但对于 MoE 模型就不能这么简单看。

MoE 模型的特点是：总参数量可能很大，但单次推理不会激活全部参数，而是只激活其中一部分专家参数。

比如 35B-A3B 这类模型，虽然名字里有 35B，但实际每次参与计算的活跃参数并不是完整 35B。也正因为如此，35B MoE 模型在中低显存机器上反而有一定操作空间。

当然，这不等于 12GB 显存可以随便跑大模型。真正能不能跑顺，还要看几个因素：

- 模型是不是 MoE 架构；
- 量化版本是否合适；
- 上下文长度设置是否过大；
- GPU Offload 是否合理；
- 是否允许部分内容落到系统内存；
- 系统内存和虚拟内存是否足够；
- 推理工具对该模型的支持是否稳定。

我的实测感受是：

> **12GB 显存跑 35B MoE，不要追求“全部塞进显存”，而是要追求“速度、质量和稳定性的平衡”。**

---

## 三、三种运行方式对比：llama.exe、Ollama、LM Studio

这次我主要使用了三种方式，每种方式适合的场景不一样。

---

### 1. llama.exe：适合压榨性能和精细控制

`llama.exe` 或 `llama-server.exe` 最大的优势是直接、轻量、参数可控。你可以清楚地指定模型路径、上下文长度、GPU offload、端口、batch、Flash Attention 等配置。

适合场景：

- 想手动控制每一个推理参数；
- 想尽可能压榨速度；
- 已经清楚自己模型文件放在哪里；
- 不需要图形界面；
- 愿意用命令行排查问题。

示例启动方式：

```bat
llama-server.exe ^
  -m "D:\Models\Qwen3.6-35B\Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-Q4_K_M.gguf" ^
  --host 127.0.0.1 ^
  --port 8080 ^
  -c 32768 ^
  -n 8192 ^
  -ngl 999 ^
  -fa on ^
  --cont-batching
```

几个参数需要特别注意：

| 参数 | 作用 | 注意事项 |
|---|---|---|
| `-m` | 模型路径 | 路径不要写错，Windows 路径建议加引号 |
| `--host` | 监听地址 | 只本机用可写 `127.0.0.1`，WSL 访问异常时再考虑 `0.0.0.0` |
| `--port` | 服务端口 | 避免和 LM Studio、Ollama 冲突 |
| `-c` | 上下文长度 | 越大越吃显存和内存 |
| `-n` | 单次最大生成 token | 不要无脑拉太大 |
| `-ngl` | GPU 卸载层数 | 通常希望尽量多上 GPU，但爆显存就要降 |
| `-fa on` | Flash Attention | 支持时建议打开 |
| `--cont-batching` | 连续批处理 | 多请求或 Agent 场景下有帮助 |

我的体感是：如果你愿意调参数，`llama.exe` 是最适合长期压榨性能的方式。

---

### 2. Ollama：适合日常管理和快速切换

Ollama 的优点是省心。模型创建、运行、命名、切换都比较统一，适合把本地模型当成一个长期服务使用。

如果是 GGUF 模型，可以写一个 `Modelfile`：

```text
FROM D:\Models\Qwen3.6-35B\Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-Q4_K_M.gguf

PARAMETER num_ctx 32768
PARAMETER temperature 0.3
PARAMETER top_p 0.9
```

然后执行：

```bash
ollama create qwen36-35b-q4km -f Modelfile
ollama run qwen36-35b-q4km
```

Ollama 默认 API 地址通常是：

```text
http://127.0.0.1:11434
```

OpenAI 兼容接口常用：

```text
http://127.0.0.1:11434/v1
```

注意事项：

1. **OpenAI API 本身不能直接在请求里随便改上下文长度。**  
   如果要改上下文，建议通过 `Modelfile` 里的 `PARAMETER num_ctx` 固定下来。

2. **模型名要短。**  
   原始模型文件名太长，接 cc Switch、Claude Code、Hermes Agent 时很容易填错。建议自己创建短模型名，例如：

   ```text
   qwen36-35b-q4km
   gemma4-26b-a4b-q4km
   ```

3. **Ollama 适合稳定常驻，但不是最适合极限调参。**  
   如果你想精细控制 GPU 层数、batch、Flash Attention，`llama.exe` 会更直接。

---

### 3. LM Studio：适合图形化调试和快速验证

LM Studio 是我最推荐新手先用的方式。因为它可以直观看到模型加载情况、显存占用、上下文设置、推理速度和 API 服务状态。

一般流程是：

1. 打开 LM Studio；
2. 导入或下载 GGUF 模型；
3. 加载模型；
4. 调整 Context Length、GPU Offload、Batch Size 等参数；
5. 打开 Developer 或 Local Server；
6. 启动本地 API 服务；
7. 使用 `/v1/models` 检查模型 ID；
8. 把 endpoint 填进 cc Switch。

常见服务地址：

```text
http://127.0.0.1:1234/v1
```

验证模型列表：

```text
http://127.0.0.1:1234/v1/models
```

LM Studio 的优势是：

- 图形化，适合快速试模型；
- API 接口清楚；
- 可以直接查看 tokens/s；
- 适合对比不同量化版本；
- 适合先验证模型能不能跑，再迁移到 llama.exe 或 Ollama。

但它也有缺点：

- 自动化程度不如命令行；
- 有些高级参数不如 llama.exe 直接；
- 多模型、多端口、多 Agent 同时使用时，要注意服务是否真的切换成功。

---

## 四、通过 cc Switch 接入 Claude Code 与 Hermes Agent

我这套环境的核心并不是“模型能聊天”，而是把本地模型变成 Claude Code 和 Hermes Agent 的后端。

cc Switch 的作用是做中间层：不同模型服务都提供 OpenAI-compatible API，cc Switch 再把它们整理成 Claude Code 或其他 Agent 能调用的 provider。

---

### 1. Provider 配置重点

以 LM Studio 为例，Provider 可以这样填：

| 配置项 | 示例 |
|---|---|
| Provider Name | `LM-Studio-Local` |
| API Endpoint | `http://127.0.0.1:1234/v1` |
| API Key | `lm-studio` 或任意占位符 |
| API Format | OpenAI Compatible |
| Model ID | 从 `/v1/models` 复制出来的真实 ID |

如果是 llama.exe：

```text
http://127.0.0.1:8080/v1
```

如果是 Ollama：

```text
http://127.0.0.1:11434/v1
```

这里最容易错的是三个地方：

1. endpoint 忘记带 `/v1`；
2. API 格式选错，把 OpenAI-compatible 当成 Anthropic 原生格式；
3. 模型 ID 自己乱填，没有从 `/v1/models` 里复制真实值。

这三个问题会导致 Claude Code 或 Hermes Agent 看起来已经连上，但实际请求失败，或者模型切换后还是在调用旧模型。

---

### 2. WSL 访问 Windows 本地服务的注意事项

我的模型服务跑在 Windows，Claude Code 和 Hermes Agent 在 WSL，所以网络访问要注意。

优先尝试：

```text
http://127.0.0.1:端口/v1
```

如果 WSL 里访问不到，可以尝试：

```bash
cat /etc/resolv.conf
```

找到 Windows host 地址后，用类似：

```text
http://Windows宿主机IP:端口/v1
```

同时要检查：

- Windows 防火墙是否拦截；
- 服务是否只监听 `127.0.0.1`；
- 是否需要改成 `--host 0.0.0.0`；
- 端口是否被其他程序占用；
- cc Switch 和模型服务是否在同一个网络可见范围内。

我的建议是：

> **一开始先本机闭环跑通，再处理 WSL 网络。**

不要一上来同时排查模型、端口、WSL、cc Switch、Claude Code，否则很难判断到底是哪一层出问题。

---

## 五、我测试过的模型

这次主要测试了以下模型：

| 模型 | 体感结论 |
|---|---|
| Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-IQ4_NL | 能跑，但综合稳定性不如 Q4_K_M |
| Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-Q4_K_M | 最好用，约 30 tokens/s |
| Qwen3.6-27B-Uncensored-HauhauCS-Aggressive-IQ4_XS | 更轻，但 Agent 场景能力感弱一些 |
| gemma-4-31B-it-UD-IQ2_M | 能塞进去，但量化过低，质量有折损 |
| gemma-4-31B-it-IQ4_XS | 可用，但没有成为主力 |
| gemma-4-26B-A4B-it-UD-Q4_K_M | 第二推荐，约 22 tokens/s |
| gemma-4-26B_q4_0-it | 能用，但综合不如 A4B Q4_K_M |

这里我没有做实验室级 benchmark，而是按照真实使用来判断：

- 能不能稳定启动；
- tokens/s 是否可接受；
- Claude Code 里能不能读文件、改代码；
- Hermes Agent 里能不能连续执行任务；
- 多轮上下文是否稳定；
- 是否容易胡乱改动项目；
- 中文、英文、代码混合任务是否自然；
- 长任务下有没有明显跑偏。

最后发现，模型“能跑”和“能用”是两回事。尤其在 Agent 场景中，模型的稳定性比单次回答质量更重要。

---

## 六、第一推荐：Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-Q4_K_M

我这次最满意的是：

```text
Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-Q4_K_M
```

本地路径示例：

```text
D:\Models\Qwen3.6-35B\Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-Q4_K_M
```

在我的 RTX 5070 12GB + 32GB 内存机器上，速度大约能到：

```text
30 tokens/s
```

这个速度已经不是“能跑着玩”，而是能进入日常使用区间。

它的优点主要有：

1. **速度足够快。**  
   30 tokens/s 左右的输出速度，接 Claude Code 时不会特别折磨。

2. **指令跟随比较稳。**  
   它不会像一些模型那样过度发挥，也不会频繁忽略约束。

3. **代码任务表现更可靠。**  
   读项目、解释报错、局部修改代码时，整体方向比较稳。

4. **中文环境友好。**  
   中文提问、英文代码、混合路径、Windows + WSL 场景都能比较自然地处理。

5. **Q4_K_M 的平衡很好。**  
   相比更低量化版本，它保留了更好的能力；相比更高量化版本，它又更容易在 12GB 显存机器上跑顺。

如果只保留一个模型，我会保留这个。

---

## 七、第二推荐：gemma-4-26B-A4B-it-UD-Q4_K_M

第二个值得保留的是：

```text
gemma-4-26B-A4B-it-UD-Q4_K_M
```

我的实测速度大约是：

```text
22 tokens/s
```

它的风格和 Qwen 不太一样。Gemma 的输出有时候更规整、更干净，但在我的 Agent 工作流里，整体可靠性略低于 Qwen3.6-35B Q4_K_M。

它适合：

- 轻量代码辅助；
- 文档总结；
- 解释类任务；
- 一般问答；
- 对中文要求没那么高的任务；
- 不希望模型输出太“冲”的场景。

如果你觉得 Qwen3.6-35B Q4_K_M 占用压力稍大，或者想准备一个备用模型，gemma-4-26B-A4B-it-UD-Q4_K_M 是这批测试里最值得留下的备选。

---

## 八、Gemma 31B 与 Qwen 27B 的体感

### 1. Gemma 31B：参数不小，但不一定更好用

我测试了：

```text
gemma-4-31B-it-UD-IQ2_M
gemma-4-31B-it-IQ4_XS
```

31B 听起来很有吸引力，但在 12GB 显存 + 32GB 内存环境里，它不一定比 26B A4B 更舒服。

尤其是 IQ2_M 这种量化，虽然能降低占用，但质量损失比较明显。对普通聊天可能还能接受，但接 Claude Code 或 Hermes Agent 时，模型一旦理解偏了，后面的自动化操作就容易连环出错。

我的结论是：

> **31B Gemma 可以试，但不适合当这套机器上的主力。**

---

### 2. Qwen 27B：更轻，但主力价值不如 35B MoE

我也测试了：

```text
Qwen3.6-27B-Uncensored-HauhauCS-Aggressive-IQ4_XS
```

它的优势是更轻，加载压力更小。但在 Agent 场景里，我更看重模型能否少犯错，而不是单纯快一点。

如果只是轻量对话，它可以用。但如果是写代码、改项目、跑多轮任务，我还是更愿意用 35B-A3B 的 Q4_K_M。

---

## 九、关键点位注意事项

下面这些是我这次踩坑后整理出来的重点。

---

### 1. 不要只看参数量，要看模型架构

35B 不一定比 27B 更难跑，31B 也不一定比 26B 更好用。MoE、A3B、A4B 这种结构会直接影响实际推理压力。

选择模型时，我现在会优先看：

```text
架构 > 量化 > 实测速度 > 参数量
```

只看参数量很容易选错。

---

### 2. Q4_K_M 通常是比较稳的甜点位

这次测试下来，我对 Q4_K_M 的印象最好。

它的优点是：

- 文件体积不会太夸张；
- 速度比较好；
- 能力保留相对稳定；
- 适合 12GB 显存机器尝试大模型；
- 比极低量化更适合 Agent 场景。

IQ2、IQ4_XS 之类的版本不是不能用，但要有心理预期：它们更像是在“尽量塞进去”，不一定是“最好用”。

---

### 3. 上下文长度不要无脑拉满

很多人一上来就想开 32K、64K、128K。但在本地模型上，上下文越大，显存、内存和速度压力都会上升。

我的建议是：

| 使用场景 | 推荐上下文 |
|---|---|
| 普通问答 | 4096 - 8192 |
| 代码辅助 | 8192 - 16384 |
| Agent 多文件任务 | 16384 - 32768 |
| 长文档处理 | 视模型和内存情况再往上加 |

Claude Code 里很多任务其实不需要一开始就开超大上下文。如果显存紧张，先把 Context Length 降下来，往往比换模型更有效。

---

### 4. GPU Offload 不是越高越好，而是要稳定

理论上，把更多层放到 GPU 上速度会更快。但如果显存接近爆掉，系统就可能开始变得不稳定，甚至直接 OOM。

调参时建议：

1. 先尽量高 offload；
2. 观察显存占用；
3. 如果爆显存或卡死，就降低上下文或 offload；
4. 记录每个模型稳定运行时的参数；
5. 不要每次都凭感觉重新调。

对 MoE 模型来说，有时候用系统内存换显存是可接受的，但前提是你的 32GB 内存不要被其他软件吃掉太多。

---

### 5. 系统内存和虚拟内存要留够

12GB 显存跑 35B MoE，本质上是在显存、内存、磁盘交换之间找平衡。

建议：

- 关闭不必要的后台软件；
- 浏览器不要开太多标签；
- 保证系统盘有足够空间；
- Windows 虚拟内存不要关；
- 任务管理器里同时观察 GPU、内存、磁盘占用。

如果系统内存被打满，即使模型没报错，整体体验也会明显变差。

---

### 6. 端口要固定，不要混用

建议给三套后端固定端口：

| 后端 | 建议端口 |
|---|---|
| llama.exe | 8080 |
| Ollama | 11434 |
| LM Studio | 1234 |

这样 cc Switch 里配置会清楚很多。

不要今天 llama.exe 用 1234，明天 LM Studio 也用 1234。端口一乱，调试成本会迅速上升。

---

### 7. endpoint 必须写完整

cc Switch 里不要只写：

```text
http://127.0.0.1:1234
```

而应该写：

```text
http://127.0.0.1:1234/v1
```

同理：

```text
http://127.0.0.1:8080/v1
http://127.0.0.1:11434/v1
```

很多连接失败，其实就是少了 `/v1`。

---

### 8. 模型 ID 要从 `/v1/models` 复制

不要凭文件名猜模型 ID。

正确做法是访问：

```text
http://127.0.0.1:1234/v1/models
```

或者对应后端的 `/v1/models`，然后复制返回结果里的真实 `id`。

cc Switch、Claude Code、Hermes Agent 里填模型名时，最好一字不差。

---

### 9. Agent 场景温度不要太高

本地模型接 Agent，不是写小说，不需要太高创造性。

我的常用参数大概是：

```text
temperature: 0.2 - 0.4
top_p: 0.8 - 0.95
```

温度太高时，模型更容易自作主张。在代码任务里，自作主张通常不是优点。

---

### 10. Claude Code 项目里建议写 CLAUDE.md

如果要让本地模型接 Claude Code，建议在项目根目录放一个 `CLAUDE.md`，写清楚：

- 项目技术栈；
- 目录结构；
- 不允许乱改的文件；
- 测试命令；
- 代码风格；
- 每次修改前要先解释计划；
- 每次修改后要给出变更摘要；
- 遇到不确定问题先读文件，不要猜。

本地模型能力不如云端顶级模型时，清晰的项目约束非常重要。与其指望模型自己懂，不如把规则写进项目。

---

### 11. Hermes Agent 更看重长期稳定性

Hermes Agent 这种 Agent 工具，不只是一次性问答，它更适合连续任务、记忆、规划和执行。

所以接 Hermes Agent 时，我更看重：

- 模型是否稳定；
- 是否容易跑偏；
- 是否能保持角色和任务边界；
- 是否能遵守工具调用格式；
- 长任务下是否还听指令；
- 是否会过度输出无关内容。

从这个角度看，Qwen3.6-35B Q4_K_M 的综合表现最好。

---

### 12. Uncensored 模型不等于一定更好

这次测试里有一些 Uncensored / Aggressive 命名的模型。我的建议是：不要被名字带节奏。

本地模型的关键不是“限制少”，而是：

- 能不能稳定完成任务；
- 能不能正确理解指令；
- 能不能少犯错；
- 能不能可靠接 Agent；
- 是否适合你的实际工作流。

本地部署也不代表可以忽略安全、版权、隐私和合法合规问题。尤其是接入 Agent 后，模型可能读写本地文件、执行命令，更应该谨慎设置权限和工作目录。

---

## 十、我的最终推荐配置

如果你和我一样是 RTX 5070 12GB + 32GB 内存，主要目标是跑本地模型接 Claude Code / Hermes Agent，我会这样推荐。

---

### 主力方案

```text
Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-Q4_K_M
```

推荐后端：

```text
llama.exe 或 LM Studio
```

推荐理由：

- 速度约 30 tokens/s；
- 质量和速度平衡最好；
- Agent 场景比较稳；
- 中文、英文、代码混合任务表现好；
- 适合长期作为主力模型。

---

### 备用方案

```text
gemma-4-26B-A4B-it-UD-Q4_K_M
```

推荐后端：

```text
LM Studio 或 Ollama
```

推荐理由：

- 速度约 22 tokens/s；
- 输出风格比较规整；
- 适合作为备用模型；
- 适合轻量 Agent、总结、解释、普通代码辅助。

---

### 不建议作为主力的模型

```text
Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-IQ4_NL
Qwen3.6-27B-Uncensored-HauhauCS-Aggressive-IQ4_XS
gemma-4-31B-it-UD-IQ2_M
gemma-4-31B-it-IQ4_XS
gemma-4-26B_q4_0-it
```

不是不能跑，而是在我的环境里，它们没有超过前两个模型。本地模型最重要的不是“参数看起来大”，而是“在你的机器上真的顺手”。

---

## 十一、推荐工作流

我现在比较舒服的工作流是：

### 第一步：用 LM Studio 快速试模型

先看模型能不能加载、速度多少、显存占用是否健康。不稳定的模型直接淘汰。

### 第二步：用 llama.exe 跑主力模型

确定主力模型后，用 `llama-server.exe` 固定参数启动，方便长期使用。

### 第三步：用 Ollama 管理备用模型

备用模型用 Ollama 建短名称，方便快速切换。

### 第四步：cc Switch 统一管理 Provider

把 LM Studio、llama.exe、Ollama 都加进 cc Switch：

```text
LM-Studio-Local    -> http://127.0.0.1:1234/v1
Llama-Server-Local -> http://127.0.0.1:8080/v1
Ollama-Local       -> http://127.0.0.1:11434/v1
```

### 第五步：Claude Code / Hermes Agent 只认 cc Switch

这样之后换模型不需要改 Claude Code 或 Hermes Agent，只需要在 cc Switch 里切后端。

---

## 十二、结论

这次测试最大的感受是：

> **12GB 显存并不是本地大模型的终点，但它要求你更会选模型、更会调参数。**

不要只看参数量。  
不要盲目追求最低量化。  
不要无脑拉满上下文。  
不要以为模型能聊天就能接 Agent。  
不要忽略 WSL、端口、API 格式、模型 ID 这些小问题。

在我的 RTX 5070 12GB + 32GB 内存机器上，最终结果是：

```text
第一名：
Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-Q4_K_M
速度：约 30 tokens/s
定位：主力模型

第二名：
gemma-4-26B-A4B-it-UD-Q4_K_M
速度：约 22 tokens/s
定位：备用模型
```

如果只保留一个，我会选 Qwen3.6-35B-A3B 的 Q4_K_M。它不是名字最短的，也不是参数看起来最夸张的，但它是这批模型里最像“能真正干活”的那个。
