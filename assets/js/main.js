// Scenario Explorer: include description + video + QA
const SCENARIOS = {
  "baseline": {
    title: "Aligned audio-video",
    text:
      "A video of a dog shouting and howling. " +
      "Both visual and audio questions have consistent answers; " +
      "models should behave like ideal multimodal reasoners.",
    video: "assets/video/canidae_aligned.mp4",
    question: "Which class best describes the visual content of this video? Options: [List of classes]. Answer using a single class name.",
    audioAnswer: "Canidae",
    videoAnswer: "Canidae"
  },
  "semantic-av": {
    title: "Video≠Audio (semantic misalignment)",
    text:
      "The video shows a cash register, but the audio is streaming a sound of a printer. " +
      "Correct answers differ between visual and audio questions, " +
      "revealing whether models can selectively trust the right stream.",
    video: "assets/video/misaligned_printer_aud_cashregis_video.mp4",
    question: "Which class best describes the visual content of this video? Options: [List of classes]. Answer using a single class name.",
    audioAnswer: "Printer",
    videoAnswer: "Cash_register"
  },
  "misleading-text": {
    title: "Misleading caption",
    text:
      "We keep audio and video aligned but prepend a wrong caption in the text query. " +
      "This tests whether language overrides clear audio-visual evidence.",
    video: "assets/video/caption_peturb.mp4",
    question: "Video_caption: Fowl. Which class best describes the visual content of this video? Options: [List of classes]. Answer the question using a single word or phrase.",
    audioAnswer: "Accordion",
    videoAnswer: "Acccordion"
  },
  "long-context": {
    title: "Long irrelevant context",
    text:
      "We append long random text after the query while leaving the audio-video semantically intact. " +
      "This probes long-context robustness: can the model retain correct grounding?",
    video: "assets/video/long_context.mp4",
    question: "Which class best describes the visual content of this video? Options: [List of classes]. Answer using a single class name. t n g u l m n t z f (5000 random letters)...",
    audioAnswer: "Explosion",
    videoAnswer: "Explosion"
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

const DEFAULT_SCENARIO_KEY = 'baseline';

document.addEventListener("DOMContentLoaded", () => {
  initScenarioExplorer();
  initAccordion();
  initAttentionToggle();
  initResultsSelector();
  initWhiteboxSelector();
});

/* ---------- Scenario Explorer ---------- */

function initScenarioExplorer() {
  const scenarioButtons = document.querySelectorAll(".scenario-btn");
  const scenarioDescription = document.getElementById("scenario-description");
  const scenarioVideo = document.getElementById("scenario-video");
  const scenarioVideoSource = document.getElementById("scenario-video-source");
  const scenarioQuestion = document.getElementById("scenario-question");
  const scenarioAudioAnswer = document.getElementById("scenario-audio-answer");
  const scenarioVideoAnswer = document.getElementById("scenario-video-answer");
  const layout = document.querySelector(".scenario-layout");

  if (
    !scenarioButtons.length ||
    !scenarioDescription ||
    !scenarioVideo ||
    !scenarioVideoSource ||
    !scenarioQuestion ||
    !scenarioAudioAnswer ||
    !scenarioVideoAnswer
  ) {
    return;
  }

  function setScenario(key) {
    const info = SCENARIOS[key];
    if (!info) return;

    // Update active button
    scenarioButtons.forEach((b) =>
      b.classList.toggle("active", b.dataset.scenario === key)
    );

    // Update text block
    scenarioDescription.innerHTML = `
      <h4>${info.title}</h4>
      <p>${info.text}</p>
    `;
    scenarioQuestion.textContent = info.question;
    scenarioAudioAnswer.textContent = info.audioAnswer;
    scenarioVideoAnswer.textContent = info.videoAnswer;

    // Update video source + poster (thumbnail of first frame)
    scenarioVideoSource.src = info.video;
    if (info.poster) {
      scenarioVideo.poster = info.poster;
    } else {
      scenarioVideo.removeAttribute("poster");
    }
    scenarioVideo.load();

    // Fade in once initialized
    if (layout) {
      layout.classList.add("scenario-visible");
    }
  }

  // Attach click handlers
  scenarioButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.scenario;
      setScenario(key);
    });
  });

  // Initialize once on load using JS data (overwrites dummy HTML)
  const defaultKey =
    Array.from(scenarioButtons).find((b) => b.classList.contains("active"))
      ?.dataset.scenario || scenarioButtons[0].dataset.scenario;

  setScenario(defaultKey);
}

/* ---------- Accordion ---------- */

function initAccordion() {
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
}

/* ---------- Attention toggle (before vs after tuning) ---------- */

function initAttentionToggle() {
  const attnButtons = document.querySelectorAll(".toggle-btn");
  const attnDescription = document.getElementById("attn-description");

  if (!attnButtons.length || !attnDescription) return;

  function setMode(mode) {
    attnButtons.forEach((b) =>
      b.classList.toggle("active", b.dataset.attn === mode)
    );

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
  }

  attnButtons.forEach((btn) => {
    btn.addEventListener("click", () => setMode(btn.dataset.attn));
  });

  // initialize from first button / active button
  const defaultMode =
    Array.from(attnButtons).find((b) => b.classList.contains("active"))
      ?.dataset.attn || attnButtons[0].dataset.attn;
  setMode(defaultMode);
}

/* ---------- Results model selector (black-box) ---------- */

function initResultsSelector() {
  const modelButtons = document.querySelectorAll(".results-model-btn");
  const modelDescription = document.getElementById("results-model-description");
  const modelFigure = document.getElementById("results-model-figure");

  if (!modelButtons.length || !modelDescription || !modelFigure) return;

  function setModel(key) {
    const info = RESULTS_MODELS[key];
    if (!info) return;

    modelButtons.forEach((b) =>
      b.classList.toggle("active", b.dataset.model === key)
    );

    modelDescription.innerHTML = `
      <h4>${info.title}</h4>
      <p>${info.text}</p>
    `;
    modelFigure.src = info.img;
    modelFigure.alt = `${info.title} robustness plot`;
  }

  modelButtons.forEach((btn) => {
    btn.addEventListener("click", () => setModel(btn.dataset.model));
  });

  const defaultKey =
    Array.from(modelButtons).find((b) => b.classList.contains("active"))
      ?.dataset.model || modelButtons[0].dataset.model;
  setModel(defaultKey);
}

/* ---------- White-box model selector ---------- */

function initWhiteboxSelector() {
  const whiteboxButtons = document.querySelectorAll(".whitebox-model-btn");
  const whiteboxDescription = document.getElementById(
    "whitebox-model-description"
  );
  const whiteboxCohenFigure = document.getElementById("whitebox-cohen-figure");
  const whiteboxHeatmapFigure = document.getElementById(
    "whitebox-heatmap-figure"
  );

  if (
    !whiteboxButtons.length ||
    !whiteboxDescription ||
    !whiteboxCohenFigure ||
    !whiteboxHeatmapFigure
  ) {
    return;
  }

  function setWhiteboxModel(key) {
    const info = WHITEBOX_MODELS[key];
    if (!info) return;

    whiteboxButtons.forEach((b) =>
      b.classList.toggle("active", b.dataset.wmodel === key)
    );

    whiteboxDescription.innerHTML = `
      <h4>${info.title}</h4>
      <p>${info.text}</p>
    `;
    whiteboxCohenFigure.src = info.cohenImg;
    whiteboxCohenFigure.alt = `${info.title} Cohen's D curves`;
    whiteboxHeatmapFigure.src = info.heatmapImg;
    whiteboxHeatmapFigure.alt = `${info.title} attention heatmaps`;
  }

  whiteboxButtons.forEach((btn) => {
    btn.addEventListener("click", () => setWhiteboxModel(btn.dataset.wmodel));
  });

  const defaultKey =
    Array.from(whiteboxButtons).find((b) => b.classList.contains("active"))
      ?.dataset.wmodel || whiteboxButtons[0].dataset.wmodel;
  setWhiteboxModel(defaultKey);
}

