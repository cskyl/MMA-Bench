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
    plots: {
      unimodal: "assets/img/results_qwen_tuned_unimodal.png",
      semantic: "assets/img/results_qwen_tuned_semantic.png",
      text: "assets/img/results_qwen_tuned_text.png",
      context: "assets/img/results_qwen_tuned_context.png"
    }
  },
  "qwen-base": {
    title: "Qwen2.5-Omni",
    text:
      "The base model already performs strongly on standard benchmarks but loses a large " +
      "fraction of accuracy when modalities conflict, especially under misleading text prompts.",
    plots: {
      unimodal: "assets/img/unimodal_qwen.png",
      semantic: "assets/img/semantic_misalign_qwen.png",
      text: "assets/img/text_misalign_qwen.png",
      context: "assets/img/long_context_qwen.png"
    }
  },
  "videollama": {
    title: "VideoLLaMA2",
    text:
      "VideoLLaMA2 is more vision-centric and can be competitive on visual prompts, but " +
      "shows weaker audio reasoning and is highly sensitive to textual distractions.",
    plots: {
      unimodal: "assets/img/unimodal_vl2.png",
      semantic: "assets/img/semantic_misalign_vl2.png",
      text: "assets/img/text_misalign_vl2.png",
      context: "assets/img/long_context_vl2.png"
    }
  },
  "gemini_2-0_fl": {
    title: "Gemini-2.0-Flash-Lite",
    text:
      "The closed-source model achieves strong headline scores but still exhibits notable " +
      "drops under semantic AV conflicts and misleading captions, revealing remaining " +
      "modality bias.",
    plots: {
      unimodal: "assets/img/unimodal_gemini_2_0_flash_lite.png",
      semantic: "assets/img/semantic_misalign_gemini_2_0_flash_lite.png",
      text: "assets/img/text_misalign_gemini_2_0_flash_lite.png",
      context: "assets/img/long_context_gemini_2_0_flash_lite.png"
    }
  },
  "pandagpt": {
    title: "PandaGPT",
    text:
      "PandaGPT shows competitive performance on aligned data but suffers significant " +
      "degradation under modality conflicts and misleading text, indicating challenges " +
      "in robust multimodal understanding.",
    plots: {
      unimodal: "assets/img/unimodal_pandagpt.png",
      semantic: "assets/img/semantic_misalign_pandagpt.png",
      text: "assets/img/text_misalign_pandagpt.png",
      context: "assets/img/long_context_pandagpt.png"
    }
  },
  "chatbridge": {
    title: "ChatBridge",
    text:
      "ChatBridge performs reasonably well on aligned scenarios but exhibits large " +
      "accuracy drops when faced with semantic AV misalignment and misleading captions, " +
      "highlighting limitations in modality integration.",
    plots: {
      unimodal: "assets/img/unimodal_Chatbridge.png",
      semantic: "assets/img/semantic_misalign_Chatbridge.png",
      text: "assets/img/text_misalign_Chatbridge.png",
      context: "assets/img/long_context_Chatbridge.png"
    }
  },
  "qwen3": {
    title: "Qwen3-Omni-30B-Instruct",
    text:
      "Qwen3-Omni-30B-Instruct demonstrates strong performance on aligned data but " +
      "experiences significant drops under semantic AV conflicts and misleading text, " +
      "indicating room for improvement in modality selectivity.",
    plots: {
      unimodal: "assets/img/unimodal_Qwen3-Omni-30B-Instruct.png",
      semantic: "assets/img/semantic_misalign_Qwen3-Omni-30B-Instruct.png",
      text: "assets/img/text_misalign_Qwen3-Omni-30B-Instruct.png",
      context: "assets/img/long_context_Qwen3-Omni-30B-Instruct.png"
    }
  },
  "gemini_2_0_f": {
    title: "Gemini-2.0-Flash",
    text:
      "Gemini-2.0-Flash shows competitive results on standard benchmarks but still " +
      "suffers notable accuracy degradation under semantic AV misalignment and misleading " +
      "captions, revealing challenges in robust multimodal reasoning.",
    plots: {
      unimodal: "assets/img/unimodal_gemini-2.0-Flash.png",
      semantic: "assets/img/semantic_misalign_gemini-2.0-Flash.png",
      text: "assets/img/text_misalign_gemini-2.0-Flash.png",
      context: "assets/img/long_context_gemini-2.0-Flash.png"
    }
  },
  "gemini_2_5_p": {
    title: "Gemini-2.5-Pro",
    text:
      "Gemini-2.5-Pro achieves strong performance on aligned and misaligned data but experiences " +
      "showing superior performance among current SoTA models.",
    plots: {
      unimodal: "assets/img/unimodal_gemini-2.5-pro.png",
      semantic: "assets/img/semantic_misalign_gemini-2.5-pro.png",
      text: "assets/img/text_misalign_gemini-2.5-pro.png",
      context: "assets/img/long_context_gemini-2.5-pro.png"
    }
  }
};

// White-box (Qwen vs VideoLLaMA) content
const WHITEBOX_MODELS = {
  qwen: {
    title: "Qwen2.5-Omni: Modality Selectivity",
    text:
      "Qwen2.5-Omni shows strong textual dominance but exhibits noticeable shifts between " +
      "audio and video tokens under modality-specific prompts, especially after alignment-aware tuning.",
    cohenVideoImg: "assets/img/whitebox_qwen_cohen_video.png",
    cohenAudioImg: "assets/img/whitebox_qwen_cohen_audio.png",
    heatmapImg: "assets/img/whitebox_qwen_heatmap.png"
  },
  videollama: {
    title: "VideoLLaMA2: Vision-Centric Attention",
    text:
      "VideoLLaMA2 allocates more attention to visual tokens across layers. Audio tokens " +
      "are comparatively under-utilized, and effect-size curves show weaker reallocation when " +
      "switching between audio and visual prompts.",
    cohenVideoImg: "assets/img/whitebox_videollama_cohen_video.png",
    cohenAudioImg: "assets/img/whitebox_videollama_cohen_audio.png",
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
  const imgUnimodal = document.getElementById("results-model-img-unimodal");
  const imgSemantic = document.getElementById("results-model-img-semantic");
  const imgText = document.getElementById("results-model-img-text");
  const imgContext = document.getElementById("results-model-img-context");

  if (
    !modelButtons.length ||
    !modelDescription ||
    !imgUnimodal ||
    !imgSemantic ||
    !imgText ||
    !imgContext
  ) {
    return;
  }

  function setModel(key) {
    const info = RESULTS_MODELS[key];
    if (!info) return;

    // Update active button
    modelButtons.forEach((b) =>
      b.classList.toggle("active", b.dataset.model === key)
    );

    // Update description text
    modelDescription.innerHTML = `
      <strong>${info.title}.</strong> ${info.text}
    `;

    // Update all four images
    if (info.plots) {
      if (info.plots.unimodal) {
        imgUnimodal.src = info.plots.unimodal;
        imgUnimodal.alt = `Unimodal ablation robustness for ${info.title}`;
      }
      if (info.plots.semantic) {
        imgSemantic.src = info.plots.semantic;
        imgSemantic.alt = `Semantic AV misalignment robustness for ${info.title}`;
      }
      if (info.plots.text) {
        imgText.src = info.plots.text;
        imgText.alt = `Misleading caption robustness for ${info.title}`;
      }
      if (info.plots.context) {
        imgContext.src = info.plots.context;
        imgContext.alt = `Long-context robustness for ${info.title}`;
      }
    }
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

/* ---------- White-box model selector ---------- */

function initWhiteboxSelector() {
  const whiteboxButtons = document.querySelectorAll(".whitebox-model-btn");
  const whiteboxDescription = document.getElementById("whitebox-model-description");

  // New IDs from the updated HTML
  const cohenVideoFigure = document.getElementById("whitebox-cohen-video");
  const cohenAudioFigure = document.getElementById("whitebox-cohen-audio");
  const whiteboxHeatmapFigure = document.getElementById("whitebox-heatmap-figure");

  // If no buttons or description, nothing to do
  if (!whiteboxButtons.length || !whiteboxDescription) {
    return;
  }

  function setWhiteboxModel(key) {
    const info = WHITEBOX_MODELS[key];
    if (!info) return;

    // Toggle active button
    whiteboxButtons.forEach((b) =>
      b.classList.toggle("active", b.dataset.wmodel === key)
    );

    // Update title + text in the description block
    whiteboxDescription.innerHTML = `
      <h4>${info.title}</h4>
      <p>${info.text}</p>
    `;

    // Swap Cohen's D plots if elements & paths exist
    if (cohenVideoFigure && info.cohenVideoImg) {
      cohenVideoFigure.src = info.cohenVideoImg;
      cohenVideoFigure.alt = `Cohen's D curves for video tokens · ${info.title}`;
    }

    if (cohenAudioFigure && info.cohenAudioImg) {
      cohenAudioFigure.src = info.cohenAudioImg;
      cohenAudioFigure.alt = `Cohen's D curves for audio tokens · ${info.title}`;
    }

    // Swap heatmap figure
    if (whiteboxHeatmapFigure && info.heatmapImg) {
      whiteboxHeatmapFigure.src = info.heatmapImg;
      whiteboxHeatmapFigure.alt = `${info.title} attention heatmaps`;
    }
  }

  // Wire up click handlers
  whiteboxButtons.forEach((btn) => {
    btn.addEventListener("click", () => setWhiteboxModel(btn.dataset.wmodel));
  });

  // Initialize from active button or default to first
  const defaultKey =
    Array.from(whiteboxButtons).find((b) => b.classList.contains("active"))
      ?.dataset.wmodel || whiteboxButtons[0].dataset.wmodel;

  setWhiteboxModel(defaultKey);
}


