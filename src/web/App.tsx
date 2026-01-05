import { useAPI } from "@agentuity/react";
import { type ChangeEvent, useCallback, useState } from "react";
import "./App.css";

const WORKBENCH_PATH = process.env.AGENTUITY_PUBLIC_WORKBENCH_PATH;

const DEFAULT_TEXT =
	"Welcome to Agentuity! This translation agent shows what you can build with the platform. It connects to AI models through our gateway, tracks usage with thread state, and runs quality checks automatically. Try translating this text into different languages to see the agent in action, and check the terminal for more details.";

const LANGUAGES = ["Spanish", "French", "German", "Chinese"] as const;
const MODELS = ["gpt-5-nano", "gpt-5-mini", "gpt-5"] as const;

export function App() {
	const [text, setText] = useState(DEFAULT_TEXT);
	const [toLanguage, setToLanguage] =
		useState<(typeof LANGUAGES)[number]>("Spanish");
	const [model, setModel] = useState<(typeof MODELS)[number]>("gpt-5-nano");
	const [hoveredHistoryIndex, setHoveredHistoryIndex] = useState<number | null>(
		null,
	);
	const [hoveredBadge, setHoveredBadge] = useState<"thread" | "session" | null>(
		null,
	);

	// RESTful API hooks for translation operations
	const { data: historyData, refetch: refetchHistory } = useAPI(
		"GET /api/translate/history",
	);
	const {
		data: translateResult,
		invoke: translate,
		isLoading,
	} = useAPI("POST /api/translate");
	const { invoke: clearHistory } = useAPI("DELETE /api/translate/history");

	// Prefer fresh data from translation, fall back to initial fetch
	const history = translateResult?.history ?? historyData?.history ?? [];
	const threadId = translateResult?.threadId ?? historyData?.threadId;

	const handleTranslate = useCallback(async () => {
		await translate({ text, toLanguage, model });
	}, [text, toLanguage, model, translate]);

	const handleClearHistory = useCallback(async () => {
		await clearHistory();
		await refetchHistory();
	}, [clearHistory, refetchHistory]);

	return (
		<div className="text-white flex font-sans justify-center min-h-screen">
			<div className="flex flex-col gap-8 max-w-3xl p-16 w-full">
				<div className="items-center flex flex-col gap-2 justify-center mb-8 relative text-center">
					<svg
						aria-hidden="true"
						aria-label="Agentuity Logo"
						className="h-auto mb-4 w-12"
						fill="none"
						height="191"
						viewBox="0 0 220 191"
						width="220"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							clipRule="evenodd"
							d="M220 191H0L31.427 136.5H0L8 122.5H180.5L220 191ZM47.5879 136.5L24.2339 177H195.766L172.412 136.5H47.5879Z"
							fill="#00FFFF"
							fillRule="evenodd"
						/>
						<path
							clipRule="evenodd"
							d="M110 0L157.448 82.5H189L197 96.5H54.5L110 0ZM78.7021 82.5L110 28.0811L141.298 82.5H78.7021Z"
							fill="#00FFFF"
							fillRule="evenodd"
						/>
					</svg>

					<h1 className="text-5xl font-thin m-0">Translation Agent</h1>

					<p className="text-gray-400 text-lg m-0">
						Powered by <span className="font-serif italic font-thin">Agentuity</span>
					</p>
				</div>

				<div className="bg-black border border-gray-900 rounded-lg p-8 shadow-2xl flex flex-col gap-6 overflow-hidden">
					<div className="items-center flex flex-wrap gap-1.5 text-gray-400">
							<span>Translate to</span>
							<select
								className="appearance-none bg-transparent border-0 border-b border-dashed border-gray-700 text-white cursor-pointer font-normal outline-none hover:border-b-cyan-400 focus:border-b-cyan-400 focus:border-solid [&_option]:bg-gray-950 [&_option]:text-white -mb-0.5"
								disabled={isLoading}
								onChange={(e: ChangeEvent<HTMLSelectElement>) =>
									setToLanguage(
										e.currentTarget.value as (typeof LANGUAGES)[number],
									)
								}
								value={toLanguage}
							>
								{LANGUAGES.map((lang) => (
									<option key={lang} value={lang}>
										{lang}
									</option>
								))}
							</select>
							<span>using
							</span>
							<select
								className="appearance-none bg-transparent border-0 border-b border-dashed border-gray-700 text-white cursor-pointer font-normal outline-none hover:border-b-cyan-400 focus:border-b-cyan-400 focus:border-solid [&_option]:bg-gray-950 [&_option]:text-white -mb-0.5"
								disabled={isLoading}
								onChange={(e: ChangeEvent<HTMLSelectElement>) =>
									setModel(e.currentTarget.value as (typeof MODELS)[number])
								}
								value={model}
							>
								<option value="gpt-5-nano">GPT-5 Nano</option>
								<option value="gpt-5-mini">GPT-5 Mini</option>
								<option value="gpt-5">GPT-5</option>
							</select>

						<div className="relative group ml-auto">
							<div className="absolute inset-0 bg-linear-to-r from-cyan-800 via-blue-500 to-purple-600 rounded-lg opacity-75 group-hover:opacity-100 blur-2xl group-hover:blur-3xl transition-all duration-700" />

							<div className="absolute inset-0 bg-cyan-600/50 rounded-lg opacity-50 blur-lg" />

							<button
								className="relative flex items-center justify-center w-full md:w-auto gap-2 font-semibold text-white px-4 py-2 bg-gray-950 rounded-lg overflow-hidden shadow-2xl cursor-pointer"
								disabled={isLoading}
								onClick={handleTranslate}
								type="button"
							>
								{isLoading ? "Translating..." : "Translate"}
							</button>
						</div>
					</div>

					<textarea
						className="bg-gray-950 border border-gray-800 rounded-md text-white outline-none resize-y py-3 px-4 min-h-28 focus:border-blue-500"
						disabled={isLoading}
						onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
							setText(e.currentTarget.value)
						}
						placeholder="Enter text to translate..."
						rows={4}
						value={text}
					/>

					{isLoading ? (
						<div className="bg-gray-950 border border-gray-800 rounded-md text-gray-600 min-h-12 py-3 px-4">
							<span className="text-cyan-400" data-loading>
								Translating to {toLanguage}
							</span>
						</div>
					) : translateResult?.translation ? (
						<div className="flex flex-col gap-3">
							<div className="bg-gray-950 border border-gray-800 rounded-md text-cyan-400 py-3 px-4">
								{translateResult.translation}
							</div>
							<div className="text-gray-500 flex flex-wrap text-xs gap-2 [&_strong]:text-gray-400">
								{translateResult.tokens > 0 && (
									<>
										<span>
											Tokens: <strong>{translateResult.tokens}</strong>
										</span>
										<span className="text-gray-700">|</span>
									</>
								)}
								{translateResult.threadId && (
									<span
										className="border-b border-dashed border-gray-700 cursor-help relative transition-colors duration-200 pb-px hover:border-b-cyan-400"
										onMouseEnter={() => setHoveredBadge("thread")}
										onMouseLeave={() => setHoveredBadge(null)}
									>
										{hoveredBadge === "thread" && (
											<div className="absolute left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-800 rounded-lg p-4 text-sm leading-normal z-10 mb-2 shadow-2xl text-left w-80 bottom-full">
												<div className="text-white font-semibold text-sm mb-2">Thread ID</div>
												<p className="text-gray-400 text-sm mb-2 [&_strong]:text-gray-200 [&_strong]:font-medium">
													Your <strong>conversation context</strong> that
													persists across requests. All translations share this
													thread, letting the agent remember history.
												</p>
												<p className="text-gray-400 text-sm mb-3 [&_em]:text-gray-200 [&_em]:not-italic [&_em]:font-semibold">
													Each request gets a unique session ID, but the{" "}
													<em>thread stays the same</em>.
												</p>
												<div className="flex flex-col gap-1.5 pt-3 border-t border-gray-800">
													<span className="text-gray-500 uppercase tracking-wide text-xs">ID</span>
													<code className="text-cyan-400 font-mono bg-gray-800 rounded break-all text-xs py-1.5 px-2">
														{translateResult.threadId}
													</code>
												</div>
											</div>
										)}
										Thread:{" "}
										<strong>{translateResult.threadId.slice(0, 12)}...</strong>
									</span>
								)}
								{translateResult.sessionId && (
									<>
										<span className="text-gray-700">|</span>
										<span
											className="border-b border-dashed border-gray-700 cursor-help relative transition-colors duration-200 pb-px hover:border-b-cyan-400"
											onMouseEnter={() => setHoveredBadge("session")}
											onMouseLeave={() => setHoveredBadge(null)}
										>
											{hoveredBadge === "session" && (
												<div className="absolute left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-800 rounded-lg p-4 text-sm leading-normal z-10 mb-2 shadow-2xl text-left w-80 bottom-full">
													<div className="text-white font-semibold text-sm mb-2">Session ID</div>
													<p className="text-gray-400 text-sm mb-2 [&_strong]:text-gray-200 [&_strong]:font-medium">
														A <strong>unique identifier</strong> for this
														specific request. Useful for debugging and tracing
														individual operations in your agent logs.
													</p>
													<p className="text-gray-400 text-sm mb-3 [&_em]:text-gray-200 [&_em]:not-italic [&_em]:font-semibold">
														Unlike threads, sessions are{" "}
														<em>unique per request</em>.
													</p>
													<div className="flex flex-col gap-1.5 pt-3 border-t border-gray-800">
														<span className="text-gray-500 uppercase tracking-wide text-xs">ID</span>
														<code className="text-cyan-400 font-mono bg-gray-800 rounded break-all text-xs py-1.5 px-2">
															{translateResult.sessionId}
														</code>
													</div>
												</div>
											)}
											Session:{" "}
											<strong>
												{translateResult.sessionId.slice(0, 12)}...
											</strong>
										</span>
									</>
								)}
							</div>
						</div>
					) : (
						<div className="bg-gray-950 border border-gray-800 rounded-md text-gray-600 min-h-12 py-3 px-4">Translation will appear here</div>
					)}
				</div>

				<div className="bg-black border border-gray-900 rounded-lg p-8">
					<div className="items-center flex justify-between mb-6">
						<h3 className="text-white text-xl font-normal leading-none m-0">Recent Translations</h3>
						{history.length > 0 && (
							<button
								className="bg-transparent border border-gray-800 rounded text-gray-400 cursor-pointer text-xs transition-all duration-200 py-1.5 px-3 hover:bg-gray-900 hover:border-gray-700 hover:text-white"
								onClick={handleClearHistory}
								type="button"
							>
								Clear
							</button>
						)}
					</div>
					<div className="bg-gray-950 border border-gray-800 rounded-md py-3 px-4">
						{history.length > 0 ? (
							<div className="flex flex-col gap-3">
								{[...history].reverse().map((entry, index) => (
									<button
										key={`${entry.timestamp}-${index}`}
										type="button"
										tabIndex={0}
										className="items-center grid text-sm gap-3 p-2 -m-2 rounded cursor-help relative transition-colors duration-150 grid-cols-[1fr_auto_auto_1fr_auto] hover:bg-gray-900 focus:outline-none"
										onMouseEnter={() => setHoveredHistoryIndex(index)}
										onMouseLeave={() => setHoveredHistoryIndex(null)}
										aria-label={`Translation from ${entry.text} to ${entry.toLanguage}: ${entry.translation}`}
									>
										{hoveredHistoryIndex === index && (
											<div className="absolute left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-800 rounded-lg p-3 text-xs z-10 mb-2 shadow-2xl min-w-52 bottom-full">
												<div className="flex flex-col gap-1.5">
													<div className="flex items-center gap-2">
														<span className="text-gray-500 min-w-14">Model</span>
														<span className="text-gray-200 font-medium">{entry.model}</span>
													</div>
													<div className="flex items-center gap-2">
														<span className="text-gray-500 min-w-14">Tokens</span>
														<span className="text-gray-200 font-medium">
															{entry.tokens}
														</span>
													</div>
												</div>
												<div className="h-px bg-gray-800 my-2" />
												<div className="flex flex-col gap-1.5">
													<div className="flex items-center gap-2">
														<span className="text-gray-500 min-w-14">Thread</span>
														<span className="text-gray-200 font-medium font-mono bg-gray-800 rounded py-0.5 px-1.5">
															{threadId?.slice(0, 12)}...
														</span>
														<span className="text-gray-600 italic text-xs">(same for all)</span>
													</div>
													<div className="flex items-center gap-2">
														<span className="text-gray-500 min-w-14">Session</span>
														<span className="text-gray-200 font-medium font-mono bg-gray-800 rounded py-0.5 px-1.5">
															{entry.sessionId.slice(0, 12)}...
														</span>
														<span className="text-gray-600 italic text-xs">(unique)</span>
													</div>
												</div>
											</div>
										)}
										<span className="text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap">{entry.text}</span>
										<span className="text-gray-700">→</span>
										<span className="bg-gray-900 border border-gray-800 rounded text-gray-400 text-center min-w-18 py-1 px-2.5 text-xs">{entry.toLanguage}</span>
										<span className="text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap">
											{entry.translation}
										</span>
										<span className="text-gray-600 font-mono text-xs">
											{entry.sessionId.slice(0, 8)}...
										</span>
									</button>
								))}
							</div>
						) : (
							<div className="text-gray-600 text-sm">History will appear here</div>
						)}
					</div>
				</div>

				<div className="bg-black border border-gray-900 rounded-lg p-8">
					<h3 className="text-white text-xl font-normal leading-none m-0 mb-6">
						Features Demonstrated
					</h3>

					<div className="flex flex-col gap-6">
						{[
							{
								key: "schemas",
								title: "Typed Schemas",
								text: (
									<>
										Uses <code className="text-white">@agentuity/schema</code> for type-safe validation
										with <code className="text-white">s.string()</code> and <code className="text-white">s.object()</code>.
									</>
								),
							},
							{
								key: "useapi",
								title: "useAPI Hook",
								text: (
									<>
										Frontend uses <code className="text-white">useAPI()</code> for typed API calls with
										automatic loading state.
									</>
								),
							},
							{
								key: "threads",
								title: "Thread & Session State",
								text: (
									<>
										Translation history persists in thread state. Thread ID
										stays the same across requests; session ID changes each
										time.
									</>
								),
							},
							WORKBENCH_PATH
								? {
										key: "workbench",
										title: (
											<>
												Try{" "}
												<a href={WORKBENCH_PATH} className="underline relative">
													Workbench
												</a>
											</>
										),
										text: <>Test the translate agent directly in the dev UI.</>,
									}
								: null,
						]
							.filter((step): step is NonNullable<typeof step> => Boolean(step))
							.map((step) => (
								<div key={step.key} className="items-start flex gap-3">
									<div className="items-center bg-green-950 border border-green-500 rounded flex size-4 shrink-0 justify-center">
										<svg
											aria-hidden="true"
											className="size-2.5"
											fill="none"
											height="24"
											stroke="var(--color-green-500)"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											viewBox="0 0 24 24"
											width="24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path d="M20 6 9 17l-5-5"></path>
										</svg>
									</div>

									<div>
										<h4 className="text-white text-sm font-normal -mt-0.5 mb-0.5">{step.title}</h4>
										<p className="text-gray-400 text-xs">{step.text}</p>
									</div>
								</div>
							))}
					</div>
				</div>
			</div>
		</div>
	);
}
