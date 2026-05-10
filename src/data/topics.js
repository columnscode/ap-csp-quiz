// Topic visual config. The "name" and "short" fields here MUST stay in sync
// with the topic keys defined in src/data/questions.json -> _meta.topics.
// If you add a new topic to questions.json, add it here too with a color.

export const TOPICS = {
  procedures: { name: "Procedures & Returns",  short: "PROC", color: "#00d4ff" },
  iteration:  { name: "Loops & Lists",         short: "LOOP", color: "#ff2db7" },
  data:       { name: "Data Abstraction",      short: "DATA", color: "#c4ff00" },
  efficiency: { name: "Algorithm Efficiency",  short: "EFF",  color: "#ff8b00" },
  debugging:  { name: "Debugging",             short: "BUG",  color: "#ff4d6d" },
  boolean:    { name: "Boolean Logic",         short: "BOOL", color: "#a78bfa" },
  binary:     { name: "Binary & Numbers",      short: "BIN",  color: "#4ade80" },
  media:      { name: "Pixels & Compression",  short: "MED",  color: "#22d3ee" },
  internet:   { name: "Internet & Networks",   short: "NET",  color: "#fb7185" },
  security:   { name: "Encryption",            short: "SEC",  color: "#fbbf24" },
  impact:     { name: "Impact of Computing",   short: "IMP",  color: "#e879f9" },
};
