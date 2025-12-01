// Scenario Explorer: include description + video + QA
const SCENARIOS = {
  baseline: {
    title: "Aligned audio–video–text",
    text:
      "A church bell video with matching bell sounds and neutral text. " +
      "Both visual and audio questions have consistent answers; " +
      "models should behave like ideal multimodal reasoners.",
    video: "assets/video/scenario_aligned.mp4",
    question: "What object is repeatedly making sound in this clip?",
    audioAnswer: "A ringing church bell.",
    videoAnswer: "A church bell swinging in the tower."
  },
  "semantic-av": {
    title: "Video≠Audio (semantic misalignment)",
    text:
      "The video shows a church bell, but the audio is a dog bark. " +
      "Correct answers differ between visual and audio questions, " +
      "revealing whether models can selectively trust the right stream.",
    video: "assets/video/scenario_semantic_av.mp4",
    question: "What object is making the sound in this clip?",
    audioAnswer: "A barking dog.",
    videoAnswer: "A ringing church bell."
  },
  "misleading-text": {
    title: "Misleading caption",
    text:
      "We keep audio and video aligned but prepend a wrong caption, e.g., " +
      '"Video caption: Vehicle." for a non-vehicle scene. ' +
      "This tests whether language overrides clear audio–visual evidence.",
    video: "assets/video/scenario_misleading_text.mp4",
    question: "What is the main object producing sound?",
    audioAnswer: "Chiming church bell.",
    videoAnswer: "Swinging church bell in the tower."
  },
  "long-context": {
    title: "Long irrelevant context",
    text:
      "We append long random text after the query while leaving the audio–video intact. " +
      "This probes long-context robustness: can the model retain correct grounding?",
    video: "assets/video/scenario_long_context.mp4",
    question: "Which object is responsible for the repeating sound?",
    audioAnswer: "The bell.",
    videoAnswer: "The bell in the tower."
  },
  "zero-frames": {
    title: "Frames zeroed (eyes closed)",
    text:
      "All visual frames are replaced by black images but the original audio is preserved. " +
      "Under audio prompts, models should rely only on sound; " +
      "visual prompts become ill-posed and expose shortcut behavior.",
    video: "assets/video/scenario_zero_frames.mp4",
    question: "What sound do you hear in this clip?",
    audioAnswer: "Church bells ringing.",
    videoAnswer: "Visual information is absent; no object is visible."
  },
  "silent-audio": {
    title: "Audio removed (ears shut)",
    text:
      "We strip the audio track but keep the visual frames. " +
      "Under visual prompts, performance should stay stable; " +
      "under audio prompts, models should ideally abstain instead of hallucinating.",
    video: "assets/video/scenario_silent_audio.mp4",
    question: "Which visible object should be making sound here?",
    audioAnswer: "Audio is silent; model should abstain.",
    videoAnswer: "Church bell visible at the top of the tower."
  }
};

// Black-box model comparison content
const RESULTS_MODELS = {
  "qwen-tuned": {
    title: "Qwen2.5-Omni (alignment-aware tuned)",
    text:
      "Our tuned model maintains high accuracy under aligned conditions and shows the " +
      "smallest degradation under semantic AV conflicts and misleading text, indicating " +
      "better modality selectivity and grounding.",
    img: "assets/img/results_model_qwen_tuned.png"
  },
  "qwen-base": {
    title: "Qwen2.5-Omni (base)",
    text:
      "The base model already performs strongly on standard benchmarks but loses a large " +
      "fraction of accuracy when modalities conflict, especially under misleading text prompts.",
    img: "assets/img/results_model_qwen_base.png"
  },
  videollama: {
    title: "VideoLLaMA2",
    text:
      "VideoLLaMA2 is more vision-centric and can be competitive on visual prompts, but " +
      "shows weaker audio reasoning and is highly sensitive to textual distractions.",
    img: "assets/img/results_model_videollama.png"
  },
  closed: {
    title: "Closed-source MLLM",
    text:
      "The closed-source model achieves strong headline scores but still exhibits notable " +
      "drops under semantic AV conflicts and misleading captions, revealing remaining " +
      "modality bias.",
    img: "assets/img/results_model_closed.png"
  }
};

// White-box (Qwen vs VideoLLaMA) content
const WHITEBOX_MODELS = {
  qwen: {
    title: "Qwen2.5-Omni: Modality Selectivity",
    text:
      "Qwen2.5-Omni shows strong textual dominance but exhibits noticeable shifts between " +
      "audio and video tokens under modality-specific prompts, especially after alignment-aware tuning.",
    cohenImg: "assets/img/whitebox_qwen_cohen.png",
    heatmapImg: "assets/img/whitebox_qwen_heatmap.png"
  },
  videollama: {
    title: "VideoLLaMA2: Vision-Centric Attention",
    text:
      "VideoLLaMA2 allocates more attention to visual tokens across layers. Audio tokens " +
      "are comparatively under-utilized, and effect-size curves show weaker reallocation when " +
      "switching between audio and visual prompts.",
    cohenImg: "assets/img/whitebox_videollama_cohen.png",
    heatmapImg: "assets/img/whitebox_videollama_heatmap.png"
  }
};

document.addEventListener("DOMContentLoaded", () => {
  /* Scenario buttons + video/Q&A update */
  const scenarioButtons = document.querySelectorAll(".scenario-btn");
  const scenarioDescription = document.getElementById("scenario-description");
  const scenarioVideo = document.getElementById("scenario-video");
  const scenarioVideoSource = document.getElementById("scenario-video-source");
  const scenarioQuestion = document.getElementById("scenario-question");
  const scenarioAudioAnswer = document.getElementById("scenario-audio-answer");
  const scenarioVideoAnswer = document.getElementById("scenario-video-answer");

  if (
    scenarioButtons.length &&
    scenarioDescription &&
    scenarioVideo &&
    scenarioVideoSource &&
    scenarioQuestion &&
    scenarioAudioAnswer &&
    scenarioVideoAnswer
  ) {
    scenarioButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        scenarioButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const key = btn.dataset.scenario;
        const info = SCENARIOS[key];
        if (!info) return;

        scenarioDescription.innerHTML = `
          <h4>${info.title}</h4>
          <p>${info.text}</p>
        `;

        scenarioQuestion.textContent = info.question;
        scenarioAudioAnswer.textContent = info.audioAnswer;
        scenarioVideoAnswer.textContent = info.videoAnswer;

        scenarioVideoSource.src = info.video;
        scenarioVideo.load();
      });
    });
  }

  /* Accordion */
  const accordionItems = document.querySelectorAll("[data-accordion-item]");
  accordionItems.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const panel = trigger.nextElementSibling;
      const icon = trigger.querySelector(".accordion-icon");
      if (!panel) return;

      const isOpen = panel.classList.contains("open");
      // close all
      document
        .querySelectorAll(".accordion-panel")
        .forEach((p) => p.classList.remove("open"));
      document
        .querySelectorAll(".accordion-icon")
        .forEach((i) => (i.textContent = "+"));

      if (!isOpen) {
        panel.classList.add("open");
        if (icon) icon.textContent = "−";
      }
    });
  });

  /* Attention toggle (before vs after tuning) */
  const attnButtons = document.querySelectorAll(".toggle-btn");
  const attnDescription = document.getElementById("attn-description");

  if (attnButtons.length && attnDescription) {
    attnButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        attnButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const mode = btn.dataset.attn;

        if (mode === "after") {
          attnDescription.innerHTML = `
            <h4>After Alignment-Aware Tuning</h4>
            <p>
              Attention shifts become stronger and more decisive: video tokens gain weight under
              visual prompts, audio tokens under audio prompts. Effect sizes increase especially
              in deeper layers, matching the improved robustness we see in MMA-Bench and related
              benchmarks.
            </p>
          `;
        } else {
          attnDescription.innerHTML = `
            <h4>Before Tuning</h4>
            <p>
              Attention is dominated by text tokens with only mild reweighting between audio and
              visual streams when prompts change. Models often follow whichever modality is
              statistically easiest instead of the one requested by the prompt.
            </p>
          `;
        }
      });
    });
  }

  /* Results model selector (black-box) */
  const modelButtons = document.querySelectorAll(".results-model-btn");
  const modelDescription = document.getElementById("results-model-description");
  const modelFigure = document.getElementById("results-model-figure");

  if (modelButtons.length && modelDescription && modelFigure) {
    modelButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        modelButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const key = btn.dataset.model;
        const info = RESULTS_MODELS[key];
        if (!info) return;

        modelDescription.innerHTML = `
          <h4>${info.title}</h4>
          <p>${info.text}</p>
        `;
        modelFigure.src = info.img;
        modelFigure.alt = `${info.title} robustness plot`;
      });
    });
  }

  /* White-box model selector (Qwen vs VideoLLaMA) */
  const whiteboxButtons = document.querySelectorAll(".whitebox-model-btn");
  const whiteboxDescription = document.getElementById("whitebox-model-description");
  const whiteboxCohenFigure = document.getElementById("whitebox-cohen-figure");
  const whiteboxHeatmapFigure = document.getElementById("whitebox-heatmap-figure");

  if (
    whiteboxButtons.length &&
    whiteboxDescription &&
    whiteboxCohenFigure &&
    whiteboxHeatmapFigure
  ) {
    whiteboxButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        whiteboxButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const key = btn.dataset.wmodel;
        const info = WHITEBOX_MODELS[key];
        if (!info) return;

        whiteboxDescription.innerHTML = `
          <h4>${info.title}</h4>
          <p>${info.text}</p>
        `;
        whiteboxCohenFigure.src = info.cohenImg;
        whiteboxCohenFigure.alt = `${info.title} Cohen's D curves`;
        whiteboxHeatmapFigure.src = info.heatmapImg;
        whiteboxHeatmapFigure.alt = `${info.title} attention heatmaps`;
      });
    });
  }
});
