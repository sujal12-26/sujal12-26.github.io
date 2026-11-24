export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  summary: string;
  image: string;
  repositoryUrl?: string;
  fullDescription: string;
  highlights?: string[];
}

const projectAsset = (path: string) => `${import.meta.env.BASE_URL}projects/${path}`;

export const PROJECTS: ProjectItem[] = [
  {
    id: 'neurosync',
    title: 'NeuroSync: Eye and Brain Signal Controlled Interaction',
    category: 'HCI / BCI · Biosensing Prototype',
    summary:
      'A learning prototype that uses eye and forehead bioelectric signals with a BioAmp EXG Pill, Arduino UNO R4 Minima, and Python for experimental LED and keyboard-control demos.',
    image: projectAsset('neurosync.png'),
    fullDescription:
      'NeuroSync explores how bioelectric signals can be used as computer input. Surface electrodes capture small voltage changes around the forehead or eyes. The BioAmp EXG Pill amplifies and conditions the signals, the Arduino samples them, and Python analyzes the readings over USB. EEG and EOG use separate electrode placements and are not measured simultaneously. The EOG demos can also use Chords-Python and its LSL stream.\n\nEEG beta-to-LED demo: Forehead readings are filtered and analyzed in two-second FFT windows to estimate relative power in the 13–30 Hz beta band. At startup, the program records a rest baseline and readings during silent subtraction by seven to set provisional personal thresholds. Matching the task threshold turns on the Arduino built-in LED; matching the rest threshold turns it off. This is an experimental signal-threshold demo, not thought recognition.\n\nEye blink-to-Spacebar demo: Electrodes above and below the eye capture a vertical EOG change during a blink. Python detects a brief event and can send a Spacebar press to an emulator or game. A blink and Spacebar response were observed in the emulator. Keyboard output is disabled by default unless explicitly enabled.\n\nLeft/right gaze-to-arrow demo: Electrodes beside the eyes capture horizontal EOG changes. Python reads Channel 1/A0, establishes a center baseline, and detects brief shifts using a provisional threshold of about 500 counts. The starting mapping is positive shift to LEFT and negative shift to RIGHT. It reports commands in dry-run mode by default; repeated trials are still needed to confirm actual arrow-key game control.\n\nSignal path: electrodes → BioAmp EXG Pill → Arduino UNO R4 Minima → Python processing → LED or keyboard command. Eye, forehead, and jaw muscle activity can affect readings, so thresholds and direction mapping need repeated testing for consistency.',
    highlights: [
      'Demonstrates EEG beta-band estimation with two-second FFT windows and personal rest/task baselines to control an Arduino LED.',
      'Explores vertical EOG blink detection for Spacebar input and horizontal EOG shifts for provisional left/right commands.',
      'Uses a BioAmp EXG Pill, surface electrodes, Arduino UNO R4 Minima, and Python; it measures signal changes rather than decoding thoughts.',
    ],
  },
  {
    id: 'ai-linux-report-generator',
    title: 'AI Linux Report Generator',
    category: 'Linux / AI',
    summary:
      'An AI-powered Linux tool that turns system information into clear, structured reports for easier review and troubleshooting.',
    image: projectAsset('ai-linux-report-generator.png'),
    repositoryUrl: 'https://github.com/sujal12-26/ai-linux-report-generator',
    fullDescription:
      'AI Linux Report Generator is designed to make Linux system information easier to understand, organize, and share. It brings relevant technical details together in a structured report so readers can review an environment without interpreting scattered command output themselves.\n\nThe intended workflow has three stages: collect or provide supported Linux system details, organize the information, and generate a report with AI-assisted summaries or explanations. Exact data sources and report sections depend on the checks implemented in the project.\n\nThe tool is intended to support Linux learners, developers, administrators, and support teams with learning, documentation, and troubleshooting context. AI-generated explanations are assistance and should be checked against the underlying system information before being used for technical decisions.',
    highlights: [
      'Collects or accepts Linux system information from supported sources.',
      'Organizes technical details into a clear, structured report.',
      'Uses AI-assisted summaries to make system findings easier to review and share.',
    ],
  },
  {
    id: 'helios',
    title: 'HELIOS',
    category: 'AI Surveillance & Threat Intelligence',
    summary:
      'An AI-powered monitoring platform that analyzes camera feeds, tracks activity, and helps operators investigate incidents from a real-time dashboard.',
    image: projectAsset('helios.png'),
    repositoryUrl: 'https://github.com/gracefulprince/Helios',
    fullDescription:
      'HELIOS is designed to bring camera feeds, detections, alerts, and incident records into one operational dashboard. Its described inputs include RTSP streams, UDP sources, and video files. Computer vision components identify and track people, vehicles, and other objects, while configured zones and tripwires provide spatial context for activity.\n\nThe platform organizes events into incidents with timelines, evidence snapshots, operator notes, and status updates. Its insights features can surface unusual activity and correlate related events across cameras. An AI assistant is intended to help operators query incidents and summarize evidence; those generated explanations should be reviewed against the underlying footage and detections.\n\nThe project describes a React and Vite dashboard with a FastAPI backend and SQLite storage. REST APIs provide application services, while WebSockets stream detections and incident updates to the interface. HELIOS is intended for authorized security and monitoring workflows with human oversight.',
    highlights: [
      'Analyzes supported camera streams and media, with object detection and tracking.',
      'Groups events into incidents with timelines, alerts, and evidence records.',
      'Streams dashboard updates in real time and supports AI-assisted investigation.',
    ],
  },
  {
    id: 'short-clips',
    title: 'Short Clips',
    category: 'Video & Creator Tools',
    summary:
      'A self-hosted video repurposing app that finds engaging moments in long videos and live streams, then turns them into captioned vertical clips.',
    image: projectAsset('short-clips.png'),
    repositoryUrl: 'https://github.com/sujal12-26/short-clips',
    fullDescription:
      'Short Clips helps creators turn long-form videos and live streams into short vertical clips. Users can provide supported YouTube, Twitch, or Kick links, or upload a video file. The app transcribes the audio locally, then uses a selected AI provider to suggest moments, hooks, and captions. Without an AI key, it can select moments using loudness instead.\n\nSelected clips are prepared in a 9:16 format with word-by-word captions and a choice of caption styles. A rolling recording buffer supports live clipping, where transcript, loudness changes, and chat activity can help identify moments while a stream is running. Separate creator workspaces keep channels, preferences, posting rules, and activity organized.\n\nShort Clips can prepare clips for queued or automatic publishing to YouTube, Instagram, and TikTok. The project uses a FastAPI server and web interface, with SQLite for local installations and support for server deployments. Its transcription model runs locally; AI selection can use a configured external provider or a local Ollama model. Users should have permission to use the source videos and follow platform rules when publishing.',
    highlights: [
      'Finds possible highlights from long videos and live streams using transcripts and AI, with a loudness-based fallback.',
      'Creates vertical 9:16 clips with word-by-word captions and multiple caption styles.',
      'Supports live clipping, creator workspaces, and queued or automatic social publishing.',
    ],
  },
  {
    id: 'engineering-language-learning-prompt-generator',
    title: 'Engineering Language Learning Prompt Generator',
    category: 'AI / Engineering Education',
    summary:
      'An AI-powered study tool that analyzes engineering slides, notes, and lecture videos, then prepares structured prompts for learning in English or regional languages.',
    image: projectAsset('engineering-language-learning-prompt-generator.png'),
    repositoryUrl:
      'https://github.com/sujal12-26/engineering-language-learning-prompt-generator',
    fullDescription:
      'Engineering Language Learning Prompt Generator turns engineering course materials into structured prompts for an AI tutor. It can analyze slide or note images, extracting content such as concepts, formulas, diagrams, and worked examples. Its video workflow combines timestamped transcripts with key frames so learners can connect explanations to moments in the lecture.\n\nStudents can choose a target language, including English, Gujarati, Hindi, Marathi, Bengali, Tamil, Telugu, or Kannada, and select how much detail the generated prompt should preserve. The project is designed to retain source context and mark unclear material instead of silently guessing. The resulting prompt is meant to be used with a separate AI model for the final lesson explanation.\n\nThe application uses Next.js, React, and TypeScript. Its documented tools include Gemini and OpenAI for AI analysis, Tesseract.js for OCR, FFmpeg for video processing, and Prisma with SQLite for data storage. Important formulas and technical claims should still be checked against trusted course material.',
    highlights: [
      'Analyzes slide images, notes, and lecture videos, including transcripts and key frames.',
      'Creates structured master prompts with selectable detail levels and multilingual output.',
      'Emphasizes preserving source context and flagging unclear content for review.',
    ],
  },
];

export const FEATURED_PROJECTS = PROJECTS.slice(0, 3);
