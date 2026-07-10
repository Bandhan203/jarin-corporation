import { useState, useRef } from "react";
import { MapPin, Upload, ChevronRight, Check, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

const STEPS = ["Land Details", "Profit Model", "Document Upload"];

type Files = { name: string; size: string }[];

const SPLIT_OPTIONS = [
  { id: "standard", label: "Standard 40/60 Split", sub: "Developer 40% · Landowner 60%", desc: "Industry-standard joint-venture ratio. Landowner receives 60% of total developed units." },
  { id: "custom", label: "Custom Negotiation", sub: "Open to Discussion", desc: "Our legal team will arrange a structured meeting to negotiate custom terms based on your land valuation." },
];

const DOC_SLOTS = [
  { id: "cs_rs", label: "CS/RS Parcha", required: true },
  { id: "mutation", label: "Mutation Certificate", required: true },
  { id: "layout", label: "Plot Layout Map", required: false },
  { id: "noc", label: "NOC from Local Authority", required: false },
];

export default function SubmitLand() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [landData, setLandData] = useState({ katha: "", decimals: "", plot: "", sector: "", district: "Dhaka" });
  const [splitModel, setSplitModel] = useState<string>("");
  const [files, setFiles] = useState<Record<string, Files>>({});
  const [dragging, setDragging] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function handleFileDrop(slotId: string, f: FileList | null) {
    if (!f) return;
    const arr = Array.from(f).map((file) => ({ name: file.name, size: `${(file.size / 1024).toFixed(0)} KB` }));
    setFiles((prev) => ({ ...prev, [slotId]: [...(prev[slotId] ?? []), ...arr] }));
  }

  const goldLine = <div className="bg-[#d4af37] h-px w-[40px] mb-[16px]" />;

  const stepValid = [
    landData.katha !== "" && landData.plot !== "",
    splitModel !== "",
    DOC_SLOTS.filter((d) => d.required).every((d) => (files[d.id]?.length ?? 0) > 0),
  ];

  if (submitted) {
    return (
      <div className="w-full min-h-screen bg-[#f9f9f9] flex items-center justify-center px-[64px]">
        <div className="bg-white border border-[#d0c5af] p-[64px] max-w-[480px] w-full flex flex-col items-center gap-[24px] text-center relative">
          <div className="absolute bg-[#735c00] left-[-12px] size-[24px] top-[-12px]" />
          <div className="w-[48px] h-[48px] bg-[#d4af37] flex items-center justify-center">
            <Check size={24} color="white" />
          </div>
          {goldLine}
          <h2 className="font-['Noto_Serif:Regular',sans-serif] font-normal text-[#1a1c1c] text-[24px] leading-[32px]" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
            Application Submitted
          </h2>
          <p className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[14px] leading-[22px]">
            Your land portfolio has been received. Our legal team will initiate verification within 48 working hours and contact you via the registered mobile number.
          </p>
          <div className="border border-[#d4af37] px-[16px] py-[10px] w-full">
            <span className="font-['Inter:Regular',sans-serif] font-normal text-[#735c00] text-[10px] tracking-[2px] uppercase leading-[15px]">Reference ID: EA-LO-2024-{Math.floor(Math.random() * 9000 + 1000)}</span>
          </div>
          <button onClick={() => navigate("/")} className="bg-[#1a1c1c] flex items-center justify-center py-[14px] px-[32px] hover:bg-[#2e2b27] transition-colors cursor-pointer w-full mt-[8px]">
            <span className="font-['Inter:Regular',sans-serif] font-normal text-white text-[11px] tracking-[2px] uppercase leading-[16px]">RETURN TO HOME</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f9f9f9]">
      <div className="flex gap-0 min-h-[calc(100vh-72px)]">

        {/* Left: Value Pitch */}
        <div className="w-[420px] shrink-0 bg-white border-r border-[#eee] flex flex-col px-[48px] py-[64px]">
          <button onClick={() => navigate(-1)} className="flex items-center gap-[6px] text-[#4d4635] hover:text-[#735c00] transition-colors cursor-pointer mb-[48px]">
            <ArrowLeft size={12} />
            <span className="font-['Inter:Regular',sans-serif] font-normal text-[10px] tracking-[2px] uppercase leading-[15px]">Back</span>
          </button>

          <div className="bg-[#d4af37] h-px w-[40px] mb-[24px]" />

          <h1 className="font-['Noto_Serif:Regular',sans-serif] font-normal text-[#1a1c1c] text-[32px] leading-[40px] tracking-[-0.5px] mb-[24px]" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
            Turn Your Idle Land Into Structured Generational Wealth.
          </h1>

          <p className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[14px] leading-[24px] mb-[40px]">
            Without spending a single penny on construction pipelines. Our co-operative model handles everything — from legal verification to construction financing — while you receive your contractual share of premium developed units.
          </p>

          <div className="flex flex-col gap-[20px]">
            {[
              { title: "Zero Capital Required", body: "We finance the entire construction cycle through our investor crowdfunding engine." },
              { title: "Legal Protection First", body: "All deeds go through independent RAJUK-certified legal review before any agreement is signed." },
              { title: "Contractual Unit Guarantee", body: "You receive a minimum of 40–60% of all developed units, registered in your name at handover." },
              { title: "Full Transparency", body: "Live construction updates, milestone photos, and financial statements available in your landowner portal." },
            ].map(({ title, body }) => (
              <div key={title} className="flex gap-[16px] items-start">
                <div className="w-[4px] h-[4px] rounded-full bg-[#d4af37] mt-[8px] shrink-0" />
                <div>
                  <span className="font-['Inter:Regular',sans-serif] font-normal text-[#1a1c1c] text-[12px] tracking-[0.5px] uppercase leading-[18px] block mb-[2px]">{title}</span>
                  <span className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[12px] leading-[18px]">{body}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Wizard */}
        <div className="flex-1 flex flex-col px-[64px] py-[64px]">
          {/* Step indicators */}
          <div className="flex items-center gap-0 mb-[48px]">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center">
                <div className="flex items-center gap-[10px]">
                  <div className="flex items-center justify-center size-[28px]"
                    style={{ background: i < step ? "#1a1c1c" : i === step ? "#735c00" : "white", border: i > step ? "1px solid #e2e2e2" : "none" }}>
                    {i < step
                      ? <Check size={12} color="white" />
                      : <span className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[14px]" style={{ color: i === step ? "white" : "#4d4635" }}>{i + 1}</span>
                    }
                  </div>
                  <span className="font-['Inter:Regular',sans-serif] font-normal text-[10px] tracking-[1.5px] uppercase leading-[14px]" style={{ color: i === step ? "#1a1c1c" : "#9e9e9e" }}>{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-[40px] h-px mx-[12px]" style={{ background: i < step ? "#d4af37" : "#e2e2e2" }} />
                )}
              </div>
            ))}
          </div>

          {/* Step cards */}
          <div className="bg-white border border-[#eee] flex-1 flex flex-col">

            {/* Step 1 */}
            {step === 0 && (
              <div className="p-[48px] flex flex-col gap-[32px]">
                {goldLine}
                <h2 className="font-['Noto_Serif:Regular',sans-serif] font-normal text-[#1a1c1c] text-[22px] leading-[30px]" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
                  Land Dimensions & Location
                </h2>
                <div className="grid grid-cols-2 gap-[24px]">
                  {/* Katha */}
                  <div className="flex flex-col gap-[8px]">
                    <label className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[10px] tracking-[1.5px] uppercase leading-[15px]">Land Size (Katha)</label>
                    <div className="relative border border-[#e2e2e2] bg-white">
                      <input
                        type="number"
                        placeholder="e.g. 10"
                        value={landData.katha}
                        onChange={(e) => setLandData((p) => ({ ...p, katha: e.target.value }))}
                        className="w-full px-[16px] py-[12px] font-['Inter:Regular',sans-serif] font-normal text-[#1a1c1c] text-[14px] leading-[20px] outline-none bg-transparent"
                      />
                      <span className="absolute right-[12px] top-1/2 -translate-y-1/2 font-['Inter:Regular',sans-serif] font-normal text-[#9e9e9e] text-[10px] tracking-[1px] uppercase">Katha</span>
                    </div>
                  </div>
                  {/* Decimals */}
                  <div className="flex flex-col gap-[8px]">
                    <label className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[10px] tracking-[1.5px] uppercase leading-[15px]">Additional (Decimals)</label>
                    <div className="relative border border-[#e2e2e2] bg-white">
                      <input
                        type="number"
                        placeholder="e.g. 5"
                        value={landData.decimals}
                        onChange={(e) => setLandData((p) => ({ ...p, decimals: e.target.value }))}
                        className="w-full px-[16px] py-[12px] font-['Inter:Regular',sans-serif] font-normal text-[#1a1c1c] text-[14px] leading-[20px] outline-none bg-transparent"
                      />
                      <span className="absolute right-[12px] top-1/2 -translate-y-1/2 font-['Inter:Regular',sans-serif] font-normal text-[#9e9e9e] text-[10px] tracking-[1px] uppercase">Decimal</span>
                    </div>
                  </div>
                  {/* Plot */}
                  <div className="flex flex-col gap-[8px]">
                    <label className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[10px] tracking-[1.5px] uppercase leading-[15px]">Plot / Holding Number</label>
                    <div className="border border-[#e2e2e2] bg-white">
                      <input
                        type="text"
                        placeholder="e.g. Plot 42, Road 7"
                        value={landData.plot}
                        onChange={(e) => setLandData((p) => ({ ...p, plot: e.target.value }))}
                        className="w-full px-[16px] py-[12px] font-['Inter:Regular',sans-serif] font-normal text-[#1a1c1c] text-[14px] leading-[20px] outline-none bg-transparent"
                      />
                    </div>
                  </div>
                  {/* Sector */}
                  <div className="flex flex-col gap-[8px]">
                    <label className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[10px] tracking-[1.5px] uppercase leading-[15px]">Sector / Thana</label>
                    <div className="border border-[#e2e2e2] bg-white">
                      <input
                        type="text"
                        placeholder="e.g. Uttara Sector 10"
                        value={landData.sector}
                        onChange={(e) => setLandData((p) => ({ ...p, sector: e.target.value }))}
                        className="w-full px-[16px] py-[12px] font-['Inter:Regular',sans-serif] font-normal text-[#1a1c1c] text-[14px] leading-[20px] outline-none bg-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Map pin picker simulation */}
                <div className="flex flex-col gap-[8px]">
                  <label className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[10px] tracking-[1.5px] uppercase leading-[15px]">Approximate Location Pin</label>
                  <div className="border border-[#e2e2e2] bg-[#f3f3f3] h-[160px] flex items-center justify-center relative overflow-hidden cursor-pointer hover:bg-[#eee] transition-colors group">
                    {/* grid lines */}
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(#d0c5af 1px, transparent 1px), linear-gradient(90deg, #d0c5af 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                    <div className="flex flex-col items-center gap-[8px] z-10">
                      <MapPin size={24} color="#d4af37" />
                      <span className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[11px] tracking-[1px] uppercase leading-[16px]">Click to Pin Location</span>
                      <span className="font-['Inter:Regular',sans-serif] font-normal text-[#9e9e9e] text-[10px] leading-[14px]">Map integration — Dhaka grid</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 1 && (
              <div className="p-[48px] flex flex-col gap-[32px]">
                {goldLine}
                <h2 className="font-['Noto_Serif:Regular',sans-serif] font-normal text-[#1a1c1c] text-[22px] leading-[30px]" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
                  Expected Profit Model
                </h2>
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[13px] leading-[22px]">
                  Select the swap model that best fits your expectation. Both models are protected under a registered joint-venture agreement.
                </p>
                <div className="flex flex-col gap-[16px]">
                  {SPLIT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setSplitModel(opt.id)}
                      className="text-left flex gap-[20px] items-start p-[24px] border transition-all cursor-pointer relative"
                      style={{ borderColor: splitModel === opt.id ? "#d4af37" : "#e2e2e2", background: splitModel === opt.id ? "rgba(212,175,55,0.04)" : "white" }}
                    >
                      <div className="w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 mt-[2px]"
                        style={{ borderColor: splitModel === opt.id ? "#d4af37" : "#9e9e9e" }}>
                        {splitModel === opt.id && <div className="w-[8px] h-[8px] rounded-full bg-[#d4af37]" />}
                      </div>
                      <div>
                        <span className="font-['Noto_Serif:Regular',sans-serif] font-normal text-[#1a1c1c] text-[15px] leading-[22px] block mb-[2px]" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>{opt.label}</span>
                        <span className="font-['Inter:Regular',sans-serif] font-normal text-[#735c00] text-[10px] tracking-[1px] uppercase leading-[15px] block mb-[8px]">{opt.sub}</span>
                        <span className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[12px] leading-[20px]">{opt.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {splitModel === "standard" && (
                  <div className="border border-[#d0c5af] p-[20px] flex flex-col gap-[8px]">
                    <span className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[10px] tracking-[2px] uppercase leading-[15px]">Projected Split (10 Katha | G+9)</span>
                    <div className="flex gap-[0px] h-[8px] w-full rounded-full overflow-hidden mt-[4px]">
                      <div className="bg-[#1a1c1c]" style={{ width: "40%" }} />
                      <div className="bg-[#d4af37]" style={{ width: "60%" }} />
                    </div>
                    <div className="flex justify-between mt-[2px]">
                      <span className="font-['Inter:Regular',sans-serif] font-normal text-[#1a1c1c] text-[10px] tracking-[0.5px] uppercase">Developer 40% · ~11 Units</span>
                      <span className="font-['Inter:Regular',sans-serif] font-normal text-[#735c00] text-[10px] tracking-[0.5px] uppercase">Landowner 60% · ~16 Units</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3 */}
            {step === 2 && (
              <div className="p-[48px] flex flex-col gap-[32px]">
                {goldLine}
                <h2 className="font-['Noto_Serif:Regular',sans-serif] font-normal text-[#1a1c1c] text-[22px] leading-[30px]" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
                  Secure Document Upload
                </h2>
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[13px] leading-[22px]">
                  All uploads are encrypted and stored in our secure legal vault. Required documents are marked with *.
                </p>
                <div className="grid grid-cols-2 gap-[16px]">
                  {DOC_SLOTS.map((slot) => {
                    const slotFiles = files[slot.id] ?? [];
                    const isDraggingThis = dragging === slot.id;

                    return (
                      <div key={slot.id} className="flex flex-col gap-[6px]">
                        <label className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[10px] tracking-[1.5px] uppercase leading-[15px]">
                          {slot.label}{slot.required && " *"}
                        </label>
                        <div
                          className="border-2 border-dashed flex flex-col items-center justify-center gap-[8px] py-[24px] px-[16px] transition-all cursor-pointer"
                          style={{ borderColor: isDraggingThis ? "#d4af37" : slotFiles.length > 0 ? "#735c00" : "#d0c5af", background: isDraggingThis ? "rgba(212,175,55,0.05)" : slotFiles.length > 0 ? "rgba(115,92,0,0.04)" : "white" }}
                          onDragOver={(e) => { e.preventDefault(); setDragging(slot.id); }}
                          onDragLeave={() => setDragging(null)}
                          onDrop={(e) => { e.preventDefault(); setDragging(null); handleFileDrop(slot.id, e.dataTransfer.files); }}
                          onClick={() => fileRefs.current[slot.id]?.click()}
                        >
                          <input ref={(el) => { fileRefs.current[slot.id] = el; }} type="file" className="hidden" multiple onChange={(e) => handleFileDrop(slot.id, e.target.files)} />
                          {slotFiles.length > 0 ? (
                            <>
                              <Check size={16} color="#735c00" />
                              {slotFiles.map((f) => (
                                <span key={f.name} className="font-['Inter:Regular',sans-serif] font-normal text-[#735c00] text-[10px] leading-[14px] text-center">{f.name}</span>
                              ))}
                            </>
                          ) : (
                            <>
                              <Upload size={16} color="#d0c5af" />
                              <span className="font-['Inter:Regular',sans-serif] font-normal text-[#9e9e9e] text-[10px] tracking-[0.5px] uppercase text-center leading-[16px]">
                                Drop PDF here<br />or click to browse
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Nav buttons */}
            <div className="mt-auto border-t border-[#eee] px-[48px] py-[24px] flex items-center justify-between">
              <button
                onClick={() => step > 0 ? setStep((s) => s - 1) : navigate(-1)}
                className="flex items-center gap-[8px] font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[10px] tracking-[2px] uppercase leading-[15px] hover:text-[#1a1c1c] transition-colors cursor-pointer"
              >
                <ArrowLeft size={12} />
                {step === 0 ? "Cancel" : "Previous"}
              </button>
              <button
                onClick={() => step < STEPS.length - 1 ? setStep((s) => s + 1) : setSubmitted(true)}
                disabled={!stepValid[step]}
                className="flex items-center gap-[8px] px-[24px] py-[12px] transition-colors cursor-pointer"
                style={{ background: stepValid[step] ? "#1a1c1c" : "#e2e2e2", cursor: stepValid[step] ? "pointer" : "not-allowed" }}
              >
                <span className="font-['Inter:Regular',sans-serif] font-normal text-[10px] tracking-[2px] uppercase leading-[15px]" style={{ color: stepValid[step] ? "white" : "#9e9e9e" }}>
                  {step < STEPS.length - 1 ? "Continue" : "Submit Application"}
                </span>
                <ChevronRight size={12} color={stepValid[step] ? "white" : "#9e9e9e"} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
