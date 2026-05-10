import { useState } from "react";
import { TOPICS } from "../data/topics.js";
import { QUESTIONS } from "../lib.js";
import {
  summarize, exportCode, importCode, clearProgress,
} from "../progress.js";

export default function HomeScreen({ onStart }) {
  const [picked, setPicked] = useState(10);
  const [showProgress, setShowProgress] = useState(false);
  const lengths = [
    { n: 5, label: "Quick", desc: "~3 min" },
    { n: 10, label: "Short", desc: "~6 min" },
    { n: 20, label: "Medium", desc: "~12 min" },
    { n: 40, label: "Long", desc: "~25 min" },
  ];

  return (
    <div className="qz-fadein">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: -10 }}>
        <button className="qz-btn qz-btn-ghost" onClick={() => setShowProgress(true)}>
          ◇ Progress
        </button>
      </div>
      <div style={{ textAlign: "center", marginBottom: 36, paddingTop: 14 }}>
        <div className="qz-uppercase" style={{ color: "var(--blue)", fontSize: "0.78rem", marginBottom: 10 }}>
          AP Computer Science Principles
        </div>
        <h1 className="qz-display" style={{
          fontSize: "clamp(2.5rem, 6vw, 4.2rem)",
          lineHeight: 1,
          margin: 0,
          background: "linear-gradient(135deg, #00d4ff 0%, #ff2db7 60%, #c4ff00 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          letterSpacing: "0.01em",
        }}>
          STUDY DROP
        </h1>
        <div style={{ color: "var(--ink-dim)", marginTop: 12, fontSize: "1rem", maxWidth: 540, margin: "12px auto 0" }}>
          {QUESTIONS.length} live questions across 11 topics. Mixed challenges. Pick your run length and go.
        </div>
      </div>

      <div className="qz-section-header" style={{ textAlign: "center", marginBottom: 14 }}>
        Choose your run
      </div>
      <div className="qz-length-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        {lengths.map(l => (
          <div
            key={l.n}
            className={"qz-length-card" + (picked === l.n ? " selected" : "")}
            onClick={() => setPicked(l.n)}
          >
            <div className="qz-display" style={{
              fontSize: "2.6rem",
              lineHeight: 1,
              marginBottom: 4,
              color: picked === l.n ? "var(--blue)" : "var(--ink)",
            }}>
              {l.n}
            </div>
            <div className="qz-uppercase" style={{ fontSize: "0.72rem", marginBottom: 4 }}>
              {l.label}
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--ink-mute)" }}>{l.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center" }}>
        <button
          className="qz-btn qz-btn-primary"
          style={{ fontSize: "1.05rem", padding: "20px 60px" }}
          onClick={() => onStart(picked)}
        >
          ► Start Run
        </button>
      </div>

      <div style={{ marginTop: 50 }}>
        <div className="qz-section-header" style={{ textAlign: "center", marginBottom: 14 }}>
          What's inside
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
          {Object.entries(TOPICS).map(([k, t]) => (
            <div key={k} className="qz-chip" style={{ justifyContent: "center" }}>
              <div className="qz-chip-dot" style={{ background: t.color }}></div>
              {t.short}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 36, textAlign: "center", color: "var(--ink-mute)", fontSize: "0.78rem" }}>
        6 question types: multiple choice · trace · binary · bug hunt · boolean · build loop
      </div>

      {showProgress && <ProgressModal onClose={() => setShowProgress(false)} />}
    </div>
  );
}

function ProgressModal({ onClose }) {
  const [stats, setStats] = useState(() => summarize(QUESTIONS));
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteValue, setPasteValue] = useState("");
  const [toast, setToast] = useState("");

  function flash(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2400);
  }

  async function handleCopy() {
    const code = exportCode();
    try {
      await navigator.clipboard.writeText(code);
      flash("Copied — paste it into Notes / email to back up.");
    } catch {
      // Clipboard API unavailable (some file:// contexts). Fall back to
      // showing the code in the textarea so the user can manual-copy.
      setPasteMode(true);
      setPasteValue(code);
      flash("Clipboard blocked — long-press / select-all and copy manually.");
    }
  }

  function handleImport() {
    const result = importCode(pasteValue);
    if (result.ok) {
      setStats(summarize(QUESTIONS));
      setPasteValue("");
      setPasteMode(false);
      flash(`Restored — merged ${result.mergedCount} question(s).`);
    } else {
      flash(`Import failed: ${result.error}`);
    }
  }

  function handleReset() {
    if (!confirm("Wipe all saved progress on this device? Cannot be undone.")) return;
    clearProgress();
    setStats(summarize(QUESTIONS));
    flash("Progress cleared on this device.");
  }

  return (
    <div className="qz-modal-backdrop" onClick={onClose}>
      <div className="qz-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div className="qz-section-header" style={{ margin: 0 }}>Your Progress</div>
          <button className="qz-btn qz-btn-ghost" onClick={onClose}>✕ Close</button>
        </div>

        <div className="qz-stat-grid">
          <Stat label="Quizzes done" value={stats.quizzes} />
          <Stat label="Questions seen" value={`${stats.seenCount} / ${stats.totalQuestions}`} />
          <Stat label="Total answered" value={stats.totalAnswered} />
          <Stat label="Accuracy" value={stats.accuracyPct == null ? "—" : `${stats.accuracyPct}%`} />
        </div>

        <div style={{ color: "var(--ink-dim)", fontSize: "0.84rem", lineHeight: 1.5, marginTop: 18 }}>
          Progress saves automatically on this device. To carry it to another
          device (e.g., phone ↔ computer), export a backup code, paste it
          into Notes or email, then import on the other device.
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 18 }}>
          <button className="qz-btn qz-btn-primary" style={{ padding: "12px 22px", fontSize: "0.85rem" }} onClick={handleCopy}>
            ⧉ Copy Backup Code
          </button>
          <button className="qz-btn qz-btn-ghost" onClick={() => setPasteMode((v) => !v)}>
            {pasteMode ? "Cancel Restore" : "↥ Restore from Code"}
          </button>
          <button className="qz-btn qz-btn-ghost" onClick={handleReset} style={{ marginLeft: "auto", color: "var(--bad)" }}>
            ⚠ Reset
          </button>
        </div>

        {pasteMode && (
          <div style={{ marginTop: 14 }}>
            <textarea
              className="qz-paste"
              placeholder="Paste backup code here..."
              value={pasteValue}
              onChange={(e) => setPasteValue(e.target.value)}
              rows={4}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
            />
            <div style={{ marginTop: 10, textAlign: "right" }}>
              <button
                className="qz-btn qz-btn-pink"
                style={{ padding: "10px 20px", fontSize: "0.82rem" }}
                onClick={handleImport}
                disabled={!pasteValue.trim()}
              >
                Import →
              </button>
            </div>
          </div>
        )}

        {toast && <div className="qz-toast">{toast}</div>}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="qz-stat">
      <div className="qz-stat-val">{value}</div>
      <div className="qz-stat-label">{label}</div>
    </div>
  );
}
