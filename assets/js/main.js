// Scenario Explorer: include description + video + QA
const SCENARIOS = {
  "baseline": {
    title: "Aligned audio-video",
    text:
      "A video of a dog shouting and howling. " +
      "Both visual and audio questions have consistent answers; " +
      "models should behave like ideal multimodal reasoners.",
    video: "assets/video/canidae_aligned.mp4",
    question: "Which class best describes the visual/audio content of this video? Options: [List of classes]. Answer using a single class name.",
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
    question: "Which class best describes the visual/audio content of this video? Options: [List of classes]. Answer using a single class name.",
    audioAnswer: "Printer",
    videoAnswer: "Cash_register"
  },
  "misleading-text": {
    title: "Misleading caption",
    text:
      "We keep audio and video aligned but prepend a wrong caption in the text query. " +
      "This tests whether language overrides clear audio-visual evidence.",
    video: "assets/video/caption_peturb.mp4",
    question: "Video_caption: Fowl. Which class best describes the visual/audio content of this video? Options: [List of classes]. Answer the question using a single word or phrase.",
    audioAnswer: "Accordion",
    videoAnswer: "Acccordion"
  },
  "long-context": {
    title: "Long irrelevant context",
    text:
      "We append long random text after the query while leaving the audio-video semantically intact. " +
      "This probes long-context robustness: can the model retain correct grounding?",
    video: "assets/video/long_context.mp4",
    question: "Which class best describes the visual/audio content of this video? Options: [List of classes]. Answer using a single class name. t n g u l m n t z f (5000 random letters)...",
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
      "Uses both video and audio cues - ablating either hurts aligned accuracy - but under semantic AV conflicts and long context its audio answers collapse while visual ones stay strong, revealing a vision- and text-leaning model that struggles to follow the requested modality.",
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
      "Shows similar cross-modal use of both streams, with clear drops when either audio or video is removed, and modest resilience to misleading captions; however, it still loses a lot of accuracy when audio and video disagree or when prompts are buried in long context.",
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
      "Very strong on aligned visual questions but barely changes when audio is muted or corrupted, and its audio-prompt accuracy collapses under AV conflict and misleading text - effectively “seeing without listening” and heavily over-trusting captions.",
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
      "Overall weakest black-box performance: it already lags on aligned data, is highly sensitive to modality conflicts and misleading captions, and is further limited by a short context window, highlighting challenges in robust multimodal grounding.",
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
      "Performs competitively on aligned clips, but behaves in a strongly text-biased way: misleading captions or text-prompt conflicts cause large drops, especially for audio questions, showing that it often trusts the language channel over the actual AV evidence.",
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
      "Matches Gemini-2.5-Pro on many aligned metrics, yet exhibits steeper declines under AV conflicts and long-context tails, indicating good raw capability but less stable integration of modalities and weaker resistance to off-topic or conflicting cues.",
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
      "High aligned accuracy with strong visual understanding, but under semantic misalignment and misleading captions its audio responses degrade sharply, revealing a tendency to over-weight visual and textual hints relative to the intended audio cue.",
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
      "Best overall black-box robustness: retains strong performance under unimodal ablations, AV conflicts, misleading captions, and long contexts, though even here audio prompts remain the weakest link, reflecting a residual visual/text preference in extreme cases.",
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
      "Shows strong text-token dominance across layers, with early and mid-layers allocating most attention mass to language tokens even when the question is purely audio/video. Under misalignment, its prompt-driven attention shift is fairly good, yielding good Cohen's-D separation between AV prompts and explaining its black-box performance on audio-focused questions.",
    cohenVideoImg: "assets/img/cohensD_video_tokens_qwen.png",
    cohenAudioImg: "assets/img/cohensD_audio_tokens_qwen.png",
    heatmapImg: "assets/img/heatmap_qwen.png"
  },
  videollama: {
    title: "VideoLLaMA2: Vision-Centric Attention",
    text:
      "Attention patterns indicate a moderately balanced AV integration, with both modalities receiving meaningful mass in mid/late layers. Yet, under misalignment, the shift between video- and audio-prompt attention is small, producing flat Cohen's-D curves. This reveals limited ability to re-route attention when cues disagree, consistent with its black-box misalignment trend.",
    cohenVideoImg: "assets/img/cohensD_video_tokens_vl2.png",
    cohenAudioImg: "assets/img/cohensD_audio_tokens_vl2.png",
    heatmapImg: "assets/img/heatmap_vl2.png"
  }
};

const demoExamples = [
  // AUDIO-PROMPT examples
  {
    id: "accordion_frog_audio",
    split: "audio",
    promptType: "audio",
    title: "Accordion player with frog sounds",
    videoSrc: "assets/video/YRz7RBslEAG0_repDiff_Frog_0.mp4",   // <-- your file
    audioContent: "Frog (misaligned audio)",
    question: "Which class best describes the audio content of this video?",
    groundTruth: "Frog",
    baselineAnswer: "Bird If you have any other questions about the audio content or anything else, feel free to ask!",
    tunedAnswer: "Frog"
  },
  {
    id: "accordion_rain_audio",
    split: "audio",
    promptType: "audio",
    title: "Accordion player with rain audio in the background",
    videoSrc: "assets/video/Ygefp9ta8LTA_repDiff_Rain_0.mp4",
    audioContent: "Rain sounds (misaligned audio)",
    question: "Which class best describes the audio content of this video?",
    groundTruth: "Rain",
    baselineAnswer: "Accordion",
    tunedAnswer: "Rain"
  },
  {
    id: "bird_glass_audio",
    split: "audio",
    promptType: "audio",
    title: "Pet bird with glass audio",
    videoSrc: "assets/video/Y7xkj4XqaynU_repDiff_Glass_0.mp4",
    audioContent: "Glass (misaligned audio)",
    question: "Which class best describes the audio content of this video?",
    groundTruth: "Glass",
    baselineAnswer: "None of the above",
    tunedAnswer: "Glass"
  },
  {
    id: "parrots_bowedstring_audio",
    split: "audio",
    promptType: "audio",
    title: "Parrots on a wall with audio of a bowed-string instrument",
    videoSrc: "assets/video/YSwZxKE3CnEg_repDiff_Bowed_string_instrument_0.mp4",
    audioContent: "Bowed_string_instrument (misaligned audio)",
    question: "Which class best describes the audio content of this video?",
    groundTruth: "Bowed_string_instrument",
    baselineAnswer: "Bird What do you think about that?",
    tunedAnswer: "Bowed_string_instrument"
  },
  {
    id: "cage_glass_audio",
    split: "audio",
    promptType: "audio",
    title: "Caged birds in video but glass sounds in audio",
    videoSrc: "assets/video/YUypQOtbE8wg_repDiff_Glass_0.mp4",
    audioContent: "Glass (misaligned audio)",
    question: "Which class best describes the audio content of this video?",
    groundTruth: "Glass",
    baselineAnswer: "Bird If you have any other questions about the video or need more details, feel free to ask!",
    tunedAnswer: "Glass"
  },
  {
    id: "cello_didgeridoo_audio",
    split: "audio",
    promptType: "audio",
    title: "Cellist playing in video with didgeridoo audio",
    videoSrc: "assets/video/YkX4-OMWCdCc_repDiff_Didgeridoo_0.mp4",
    audioContent: "Didgeridoo (misaligned audio)",
    question: "Which class best describes the audio content of this video?",
    groundTruth: "Didgeridoo",
    baselineAnswer: "Bowed_string_instrument",
    tunedAnswer: "Didgeridoo"
  },
  {
    id: "trumpet_fryingfood_audio",
    split: "audio",
    promptType: "audio",
    title: "Woman playing trumpet with frying food audio",
    videoSrc: "assets/video/YA_0xhMEZ1Cg_repDiff_Frying_food_0.mp4",
    audioContent: "Frying_food (misaligned audio)",
    question: "Which class best describes the audio content of this video?",
    groundTruth: "Glass",
    baselineAnswer: "Brass_instrument What do you think about the audio content?",
    tunedAnswer: "Frying_food"
  },
  {
    id: "trumpet_cat_audio",
    split: "audio",
    promptType: "audio",
    title: "Woman playing trumpet overlayed with cat meowing audio",
    videoSrc: "assets/video/Y9ivV2chJLa4_repDiff_Cat_0.mp4",
    audioContent: "Cat (Misaligned audio)",
    question: "Which class best describes the audio content of this video?",
    groundTruth: "Cat",
    baselineAnswer: "Brass_instrument",
    tunedAnswer: "Cat"
  },


  // VISUAL-PROMPT examples
  {
    id: "applause_clock_visual",
    split: "visual",
    promptType: "visual",
    title: "Audience applauding with clock audio",
    videoSrc: "assets/video/YLEn3f97acaw_repDiff_Clock_0.mp4",
    audioContent: "Clock (misaligned audio)",
    question: "Which class best describes the visual content of this video?",
    groundTruth: "Applause",
    baselineAnswer: "Clock",
    tunedAnswer: "Applause"
  },
  {
    id: "bird_clapping_visual",
    split: "visual",
    promptType: "visual",
    title: "Bird on perch with clapping audio",
    videoSrc: "assets/video/YPkDHPoMjvJ8_repDiff_Clapping_0.mp4",
    audioContent: "Clapping (misaligned audio)",
    question: "Which class best describes the visual content of this video?",
    groundTruth: "Bird",
    baselineAnswer: "Applause",
    tunedAnswer: "Bird"
  },
  {
    id: "skybird_glass_visual",
    split: "visual",
    promptType: "visual",
    title: "Bird flying in the sky with glass audio",
    videoSrc: "assets/video/YhRHKxyErgZw_repDiff_Glass_0.mp4",
    audioContent: "Glass (misaligned audio)",
    question: "Which class best describes the visual content of this video?",
    groundTruth: "Bird",
    baselineAnswer: "Glass",
    tunedAnswer: "Bird"
  },
  {
    id: "canidae_door_visual",
    split: "visual",
    promptType: "visual",
    title: "Dogs wrestling its owner with door sounds",
    videoSrc: "assets/video/Y3CZ1i2_tKn0_repDiff_Door_0.mp4",
    audioContent: "Door (misaligned audio)",
    question: "Which class best describes the visual content of this video?",
    groundTruth: "Canidae",
    baselineAnswer: "Cash_register",
    tunedAnswer: "Canidae"
  },
];

const DEFAULT_SCENARIO_KEY = 'baseline';

document.addEventListener("DOMContentLoaded", () => {
  initScenarioExplorer();
  initAccordion();
  initAttentionToggle();
  initResultsSelector();
  initWhiteboxSelector();
  const demoToggles = document.querySelectorAll(".demo-toggle-group .toggle-btn");

  if (demoToggles.length) {
    demoToggles.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.disabled) return;
        demoToggles.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const split = btn.dataset.demoSplit || "audio";
        renderDemoGallery(split);
      });
    });

    // initial view
    renderDemoGallery("audio");
  }
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

// ─────────────────────────────────────────────
// Qualitative demo gallery (semantic AV)
// ─────────────────────────────────────────────

function renderDemoGallery(split) {
  const container = document.getElementById("demo-gallery");
  if (!container) return;

  const items = demoExamples.filter((ex) => ex.split === split);

  container.innerHTML = items
    .map((ex) => {
      const promptBadge =
        ex.promptType === "audio"
          ? `<span class="demo-prompt-badge demo-prompt-audio">🔊 AUDIO prompt</span>`
          : `<span class="demo-prompt-badge demo-prompt-visual">🎬 VISUAL prompt</span>`;

      return `
      <article class="demo-example-card">
        <header class="demo-example-header">
          <div>
            ${promptBadge}
            <h3>${ex.title}</h3>
          </div>
        </header>

        <div class="demo-video-row">
          <video controls preload="metadata">
            <source src="${ex.videoSrc}" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        <div class="demo-meta">
          <div class="demo-audio-tag">
            <span class="demo-audio-icon">🔊</span>
            <span><strong>Audio content:</strong> ${ex.audioContent}</span>
          </div>
          <p class="demo-question">
            <strong>Q:</strong> ${ex.question}
          </p>
          <p class="demo-gt">
            <strong>Ground Truth:</strong> ${ex.groundTruth}
          </p>
        </div>

        <div class="demo-preds">
          <div class="demo-pred-row demo-pred-baseline">
            <div class="demo-pred-label">
              <span class="demo-model-pill">Qwen2.5-Omni-7B</span>
              <span class="demo-pred-tag demo-pred-tag-bad">Over-rides query</span>
            </div>
            <p class="demo-pred-text">${ex.baselineAnswer}</p>
          </div>

          <div class="demo-pred-row demo-pred-tuned">
            <div class="demo-pred-label">
              <span class="demo-model-pill demo-model-pill-ours">
                Qwen2.5-Omni-7B + Ours
              </span>
              <span class="demo-pred-tag demo-pred-tag-good">
                Grounded in requested modality
              </span>
            </div>
            <p class="demo-pred-text">${ex.tunedAnswer}</p>
          </div>
        </div>
      </article>`;
    })
    .join("");
}
