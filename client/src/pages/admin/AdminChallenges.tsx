import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

type VarRange = { min: number; max: number; isEven?: boolean; isOdd?: boolean }

function AdminChallenges() {
  const { topicId, challengeId } = useParams()
  const navigate = useNavigate()
  const isEditMode = Boolean(challengeId)

  const [title, setTitle] = useState("")
  const [challengeText, setChallengeText] = useState("")
  const [difficulty, setDifficulty] = useState("")
  const [goldTimeSec, setGoldTimeSec] = useState<number | "">("")
  const [silverTimeSec, setSilverTimeSec] = useState<number | "">("")
  const [xpGold, setXpGold] = useState<number | "">("")
  const [xpSilver, setXpSilver] = useState<number | "">("")
  const [xpBronze, setXpBronze] = useState<number | "">("")
  const [variablesRange, setVariablesRange] = useState<VarRange[]>([])
  const [alternativesOptions, setAlternativesOptions] = useState<Record<string, string>[]>([])
  const [correctAnswer, setCorrectAnswer] = useState("")
  const [hintText, setHintText] = useState("")

  useEffect(() => {
    if (!challengeId) return
    const loadChallenge = async () => {
      try {
        const { data } = await axios.get(`/mathly/topics/${topicId}/challenges`)
        const challenge = data.find((c: any) => c.challenge_id === challengeId)
        if (!challenge) return

        setTitle(challenge.title)
        setChallengeText(challenge.challenge_text)
        setDifficulty(challenge.difficulty)
        setGoldTimeSec(challenge.gold_time_sec)
        setSilverTimeSec(challenge.silver_time_sec)
        setXpGold(challenge.xp_gold)
        setXpSilver(challenge.xp_silver)
        setXpBronze(challenge.xp_bronze)
        setVariablesRange(challenge.variables_range ?? [])
        setAlternativesOptions(challenge.alternatives_options ?? [])
        setCorrectAnswer(challenge.correct_answer)
        setHintText(challenge.hint_text)
      } catch (error) {
        console.log("Failed to load challenge:", error);
      }
    }
    loadChallenge()
  }, [challengeId, topicId])

  const handleSubmit = async () => {
    if (
      !title ||
      !challengeText ||
      !difficulty ||
      goldTimeSec === "" ||
      silverTimeSec === "" ||
      xpGold === "" ||
      xpSilver === "" ||
      xpBronze === "" ||
      variablesRange.length === 0 ||
      alternativesOptions.length === 0 ||
      !correctAnswer ||
      !hintText
    ) {
      console.log("Please fill all fields");
      return;
    }

    const payload = {
      title,
      challenge_text: challengeText,
      difficulty,
      gold_time_sec: goldTimeSec,
      silver_time_sec: silverTimeSec,
      xp_gold: xpGold,
      xp_silver: xpSilver,
      xp_bronze: xpBronze,
      variables_range: variablesRange,
      alternatives_options: alternativesOptions,
      correct_answer: correctAnswer,
      hint_text: hintText,
    }

    try {
      const token = localStorage.getItem('token')
      const response = isEditMode
        ? await axios.patch(`/mathly/challenges/${challengeId}`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          })
        : await axios.post(`/mathly/topics/${topicId}/challenges`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          })

      console.log(isEditMode ? "Challenge updated:" : "Challenge created:", response.data);
      if (isEditMode) navigate(`/topics/${topicId}`)
    } catch (error) {
      console.log(isEditMode ? "Failed to update challenge:" : "Failed to create challenge:", error);
    }
  }

  const handleDelete = async () => {
    if (!challengeId) return
    if (!window.confirm("Delete this challenge? This cannot be undone.")) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/mathly/challenges/${challengeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      navigate(`/topics/${topicId}`)
    } catch (error) {
      console.log("Failed to delete challenge:", error);
    }
  }
  const letters = ['a', 'b', 'c', 'd']

  const addVariableRange = () => {
    setVariablesRange((prev) => [...prev, { min: 0, max: 0 }])
  }

  const updateVariableRange = (index: number, field: keyof VarRange, value: number | boolean) => {
    setVariablesRange((prev) =>
      prev.map((range, i) => (i === index ? { ...range, [field]: value } : range)),
    )
  }

  const removeVariableRange = (index: number) => {
    setVariablesRange((prev) => prev.filter((_, i) => i !== index))
  }

  const addAlternative = () => {
    if (alternativesOptions.length >= letters.length) return
    setAlternativesOptions((prev) => [...prev, { [letters[prev.length] ?? String(prev.length)]: '' }])
  }

  const updateAlternative = (index: number, value: string) => {
    setAlternativesOptions((prev) =>
      prev.map((option, i) => (i === index ? { [Object.keys(option)[0]]: value } : option)),
    )
  }

  const removeAlternative = (index: number) => {
    setAlternativesOptions((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] px-4 sm:px-6 md:px-8 py-10">
      <div className="max-w-2xl mx-auto">

        {/* Header with skewed cyan blade */}
        <div className="relative pl-5 mb-8">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-cyan-400 -skew-x-12" />
          <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
            {isEditMode ? "Edit Challenge" : "Manage Challenges"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isEditMode ? "Update this challenge" : `Create a new challenge for topic ${topicId}`}
          </p>
        </div>

        {/* Form card */}
        <div className="bg-[#0f1629] border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4">

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Title
            </label>
            <input
              type="text"
              placeholder="e.g. logic_propositions"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0a0f1e] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Challenge text
            </label>
            <input
              type="text"
              placeholder="e.g. resolve: {0} + {1}"
              value={challengeText}
              onChange={(e) => setChallengeText(e.target.value)}
              className="w-full bg-[#0a0f1e] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-colors"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              {'{0}, {1}, ...'} refer to the variables below by order (1st variable = {'{0}'}, 2nd = {'{1}'}, etc).
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-[#0a0f1e] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-colors"
            >
              <option value="">Select difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                Gold time (sec)
              </label>
              <input
                type="number"
                value={goldTimeSec}
                onChange={(e) => setGoldTimeSec(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-[#0a0f1e] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                Silver time (sec)
              </label>
              <input
                type="number"
                value={silverTimeSec}
                onChange={(e) => setSilverTimeSec(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-[#0a0f1e] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                XP gold
              </label>
              <input
                type="number"
                value={xpGold}
                onChange={(e) => setXpGold(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-[#0a0f1e] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                XP silver
              </label>
              <input
                type="number"
                value={xpSilver}
                onChange={(e) => setXpSilver(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-[#0a0f1e] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                XP bronze
              </label>
              <input
                type="number"
                value={xpBronze}
                onChange={(e) => setXpBronze(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-[#0a0f1e] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                Variables range
              </label>
              <button
                type="button"
                onClick={addVariableRange}
                className="text-xs text-cyan-300 hover:text-cyan-200"
              >
                + Add variable
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mb-2">
              Order matters: the Nth variable added here is referenced as {'{'}N-1{'}'} in the fields below (1st = {'{0}'}, 2nd = {'{1}'}, ...).
            </p>
            <div className="space-y-2">
              {variablesRange.map((range, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-xs text-cyan-300 w-8 shrink-0">{`{${index}}`}</span>
                  <input
                    type="number"
                    placeholder="min"
                    value={range.min}
                    onChange={(e) => updateVariableRange(index, 'min', Number(e.target.value))}
                    className="w-full bg-[#0a0f1e] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-colors"
                  />
                  <input
                    type="number"
                    placeholder="max"
                    value={range.max}
                    onChange={(e) => updateVariableRange(index, 'max', Number(e.target.value))}
                    className="w-full bg-[#0a0f1e] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-colors"
                  />
                  <label className="flex items-center gap-1 text-xs text-slate-400 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={!!range.isEven}
                      onChange={(e) => updateVariableRange(index, 'isEven', e.target.checked)}
                    />
                    even
                  </label>
                  <label className="flex items-center gap-1 text-xs text-slate-400 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={!!range.isOdd}
                      onChange={(e) => updateVariableRange(index, 'isOdd', e.target.checked)}
                    />
                    odd
                  </label>
                  <button
                    type="button"
                    onClick={() => removeVariableRange(index)}
                    className="text-slate-500 hover:text-red-400 text-xs"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                Alternatives options
              </label>
              <button
                type="button"
                onClick={addAlternative}
                disabled={alternativesOptions.length >= letters.length}
                className="text-xs text-cyan-300 hover:text-cyan-200 disabled:text-slate-600 disabled:hover:text-slate-600 disabled:cursor-not-allowed"
              >
                + Add alternative
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mb-2">
              Use {'{0}, {1}, ...'} to reference the variables above by order.
            </p>
            <div className="space-y-2">
              {alternativesOptions.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-4">{Object.keys(option)[0]}</span>
                  <input
                    type="text"
                    placeholder="e.g. {0} + {1}"
                    value={Object.values(option)[0] ?? ''}
                    onChange={(e) => updateAlternative(index, e.target.value)}
                    className="w-full bg-[#0a0f1e] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => removeAlternative(index)}
                    className="text-slate-500 hover:text-red-400 text-xs"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Correct answer
            </label>
            <input
              type="text"
              placeholder="e.g. {0} + {1}"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              className="w-full bg-[#0a0f1e] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-colors"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Use {'{0}, {1}, ...'} to reference the variables above by order.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Hint text
            </label>
            <input
              type="text"
              placeholder="A short hint shown to the user"
              value={hintText}
              onChange={(e) => setHintText(e.target.value)}
              className="w-full bg-[#0a0f1e] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-colors"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <button
              onClick={handleSubmit}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-cyan-400 text-[#0a0f1e] text-sm font-semibold font-['Space_Grotesk'] tracking-wide hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 focus:ring-offset-2 focus:ring-offset-[#0f1629] transition-colors"
            >
              {isEditMode ? "Save changes" : "Create challenge"}
            </button>
            {isEditMode && (
              <button
                onClick={handleDelete}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-transparent border border-red-500/50 text-red-400 text-sm font-semibold font-['Space_Grotesk'] tracking-wide hover:bg-red-500/10 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/60 focus:ring-offset-2 focus:ring-offset-[#0f1629] transition-colors"
              >
                Delete challenge
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminChallenges
