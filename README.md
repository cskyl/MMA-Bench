# Some Modalities are More Equal Than Others: <br> Decoding and Architecting Multimodal Integration in MLLMs

<div align="center">

[![arXiv](https://img.shields.io/badge/arXiv-2511-22826.svg)](https://arxiv.org/abs/2511.22826)
[![Project Page](https://img.shields.io/badge/Project-Website-blue)](https://cskyl.github.io/MMA-Bench/)
[![HuggingFace Dataset](https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-MMA--Bench-orange)](https://huggingface.co/datasets/dghadiya/MMA-Bench)
<!-- [![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2Fcskyl%2FMMA-Bench&count_bg=%2379C83D&title_bg=%23555555&icon=&icon_color=%23E7E7E7&title=hits&edge_flat=false)](https://hits.seeyoufarm.com) -->

**Tianle Chen**<sup>1*</sup>, **Chaitanya Chakka**<sup>1*</sup>, **Arjun Reddy Akula**<sup>2</sup>, **Xavier Thomas**<sup>1</sup>, **Deepti Ghadiyaram**<sup>1</sup>

<sup>1</sup>Boston University, <sup>2</sup>Google DeepMind
<br>
*Equal Contribution*


<br>

![MMA-Bench Overview](assets/main.png)
> **We propose MMA-Bench to expose how MLLMs behave when sight, sound, and language conflict.** Each example presents a controlled modality conflict (e.g., audio, video, or text) and asks two modality-specific questions. Correct answers differ across modalities, forcing the model to attend to the reliable modality\.
</div>

---

## 📢 Updates
* **[2025-12]** 🚀 **MMA-Bench** dataset and code are released!
* **[2025-12]** 📄 Paper is now available on arXiv.

---

## 📖 Abstract

Despite remarkable advancements in Multimodal Large Language Models (MLLMs), a fundamental question remains: **are MLLMs robust to contradicting modalities?** To rigorously study this, we introduce **MMA-Bench** comprising videos and tasks that probe a model's reliance on specific modalities. Using black-box and white-box interpretability techniques, we provide a critical analysis of the brittleness of both open- and closed-sourced MLLMs. We show that current MLLMs struggle under misaligned audio-visual pairs and simple misleading text, thereby lacking robust multi-modal reasoning. Building on these findings, we propose a modality alignment tuning strategy to teach the model when to prioritize, leverage, or ignore specific modality cues. Through extensive experiments and analysis, we show that our alignment tuning yields demonstrably stronger multimodal grounding. This work provides both interpretability tools and a clear path toward developing MLLMs with intrinsically reliable cross-modal reasoning. 

---

## 🏆 Leaderboard

We evaluate models on **MMA-Bench** under two key settings: **Aligned** (standard AV) and **Misaligned** (Visual/Audio conflict).

### Semantic Misalignment (Main Benchmark)
Accuracy (%) on Visual-focused and Audio-focused prompts when modalities conflict.

| Rank | Model | Size | Visual (Align) | Visual (Misalign) | Audio (Align) | Audio (Misalign) |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| 🥇 | **Qwen2.5-Omni-7B + Ours** | 7B | 94.68 | **94.37** | **88.14** | **79.79** |
| 🥈 | **Gemini-2.5-Pro** | - | **97.90** | 95.28 | 60.37 | 24.95 |
| 🥉 | **Gemini-2.0-Flash** | - | 96.71 | 91.91 | 57.21 | 9.42 |
| 4 | Qwen3-Omni-30B | 30B | 92.88 | 76.68 | 57.39 | 14.58 |
| 5 | Qwen2.5-Omni-7B (Base) | 7B | 76.68 | 58.72 | 46.60 | 25.16 |
| 6 | ChatBridge | 13B | 51.64 | 54.71 | 41.61 | 7.07 |
| 7 | VideoLLaMA2 | 7B | 56.35 | 36.11 | 36.12 | 18.46 |
| 8 | PandaGPT | 13B | 28.75 | 29.79 | 13.12 | 1.18 |

<!-- ### 2. Zero-Shot Abstention Test ("None of the Above")
Accuracy (%) when the queried modality is removed (e.g., Audio Removed for Visual Prompt). [cite_start]A high score indicates the model correctly abstains from hallucinating[cite: 947].

| Model | Visual Abstention (Frames Zeroed) | Audio Abstention (Audio Removed) |
| :--- | :---: | :---: |
| **Qwen2.5-Omni-7B + Ours** | **90.27%** | 0.00% |
| ChatBridge | 55.77% | **37.69%** |
| Gemini-1.5-Pro* | 47.42% | 3.79% |
| Qwen3-Omni-30B | 15.05% | 11.71% |
| PandaGPT | 11.25% | 0.61% |
| Qwen2.5-Omni-7B (Base) | 10.94% | 9.86% |
| Gemini-2.0-Flash | 3.04% | 1.06% |

*\*Note: Reported as Gemini-1.5-Pro in ablation studies.* -->

---

## 🛠️ Installation

### Environment Setup
```bash
git clone [https://github.com/cskyl/MMA-Bench.git](https://github.com/cskyl/MMA-Bench.git)
cd MMA-Bench
```

### LLAMA-Factory Integration
Our training pipeline leverages **[LLAMA-Factory](https://github.com/hiyouga/LLaMA-Factory)** for efficient fine-tuning.

```bash
git clone --depth 1 https://github.com/hiyouga/LLaMA-Factory.git
cd LLaMA-Factory
pip install -e ".[torch,metrics]" --no-build-isolation
```

## 📂 Data Preparation

We curate **MMA-Bench** from AudioSet using a rigorous 2-stage filtering pipeline to ensure semantic alignment.

1.  **Download Metadata:** Get the JSON metadata containing YouTube IDs and timestamps.
2. **Generate Perturbations:** Create the benchmark variants, including Audio-Visual Swaps (Misaligned), Audio Removed, and Frames Zeroed according to the video clips.
3.  **Process Videos:** During the fine-tuning step, using our script to download and preprocess samples. We strictly enforce a center crop to 504x504 and a standardized 10s duration.

```bash
# 1. Download metadata from Hugging Face
hf download dghadiya/MMA-Bench --repo-type=dataset

# Run processing script (requires ffmpeg)
python scripts/prepare_data.py 
```

## 🚀 Training & Evaluation

### Modality-Aware Fine-Tuning
We use LoRA(Low-Rank Adaptation) to fine-tune to handle conflicting modalities.

```bash
# Setup training with LLAMA-Factory
git clone --depth 1 https://github.com/hiyouga/LLaMA-Factory.git
cd LLaMA-Factory
pip install -e ".[torch,metrics]" --no-build-isolation
```
**Key Configurations**:
* `learning_rate`: 1e-4 
* `batch_size`: 4 
* `lora_rank`: 8
* `fp16`: true
* `gradient_accumulation_steps`: 4

## 📚 Model Zoo & Baselines

We evaluate our method against the following state-of-the-art MLLMs utilized in our study:

| Model | Type | Link |
| :--- | :---: | :---: |
| **Qwen2.5-Omni** | Open Source | [GitHub](https://github.com/QwenLM/Qwen2.5-Omni) |
| **Qwen3-Omni**  | Open Source | [GitHub](https://github.com/QwenLM/Qwen3-Omni) |
| **VideoLLaMA2**  | Open Source | [GitHub](https://github.com/DAMO-NLP-SG/VideoLLaMA2) |
| **ChatBridge**  | Open Source | [GitHub](https://github.com/joez17/ChatBridge) |
| **PandaGPT**  | Open Source | [GitHub](https://github.com/yxuansu/PandaGPT) |
| **Gemini-2.5-Pro** | Close Source |  Google DeepMind  |
| **Gemini-2.0-Flash**  | Close Source  |  Google DeepMind  |
| **Gemini-2.0-Flash-Lite**  | Close Source  | Google DeepMind |

---

## 🖊️ Citation

If you find this work helpful, please cite our paper:

```bibtex
@article{chen2025some,
  title={Some Modalities are More Equal Than Others: Decoding and Architecting Multimodal Integration in MLLMs},
  author={Chen, Tianle and Chakka, Chaitanya and Akula, Arjun Reddy and Thomas, Xavier and Ghadiyaram, Deepti},
  journal={arXiv preprint arXiv:2511.22826},
  year={2025}
}
```
## Acknowledgements
We thank the open-source community for Qwen2.5-Omni and LLAMA-Factory for their excellent codebases.

We thank our collaborators and colleagues for their valuable feedback and support throughout this project. We also respectfully acknowledge that Arjun Reddy Akula participated in an advisory capacity only.