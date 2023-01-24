class PerformanceAggregator {
	static #privateComputePerfStats(perfMeasuresByStudy, study, perfType, valueKey, fractionFactor, valueTransformer) {
		const baselinePerf = perfMeasuresByStudy[BASELINE_STUDY][KEY_PERF_TESTING_NO_INSTRUMENTATION];
		const withInstRuntimePerf = perfMeasuresByStudy[study.name][KEY_PERF_INSTRUMENTATION];
		const withoutInstRuntimePerf = perfMeasuresByStudy[study.name][KEY_PERF_TESTING_NO_INSTRUMENTATION];

		let basePerfValue = valueTransformer(baselinePerf[valueKey]);
		const noInstRuntimeMemory = valueTransformer(withoutInstRuntimePerf[valueKey]);
		const withInstRuntimeMemory = valueTransformer(withInstRuntimePerf[valueKey]);

		basePerfValue = Math.min(basePerfValue, noInstPerfValue, withInstPerfValue);

		const perfPlusDueToInstrumentation = Math.max(0, withInstPerfValue - noInstPerfValue);
		const noInstPerfDiffToBase = noInstPerfValue - basePerfValue;
		const withInstPerfDiffToBase = withInstPerfValue - basePerfValue;

		const ifZeroElse = (valueInCaseOfZero, toCheck) => {
			if (toCheck === 0) {
				return valueInCaseOfZero;
			}
			return toCheck;
		};

		const result = {};
		result[perfType + 'Base'] = basePerfValue;
		result[perfType + 'WithInstAbs'] = withInstPerfValue;
		result[perfType + 'NoInstAbs'] = noInstPerfValue;
		result[perfType + 'AbsPlusDueToInst'] = perfPlusDueToInstrumentation;
		result[perfType + 'InstNoInstFraction'] = withInstPerfValue / noInstPerfValue;
		result[perfType + 'WithInstNormalized'] = withInstPerfDiffToBase;
		result[perfType + 'NoInstNormalized'] = noInstPerfDiffToBase;
		result[perfType + 'NormalizedDelta'] = withInstPerfDiffToBase - noInstPerfDiffToBase;
		result[perfType + 'NormalizedFraction'] = withInstPerfDiffToBase / noInstPerfDiffToBase;
		result[perfType + 'NormalizedFraction' + String(fractionFactor)] =
			Math.round(withInstPerfDiffToBase / fractionFactor) /
			ifZeroElse(1, Math.round(noInstPerfDiffToBase / fractionFactor));
		result[perfType + 'NormalizedFraction'] = withInstPerfDiffToBase / noInstPerfDiffToBase / fractionFactor;

		return result;
	}

	static aggregatePerformanceResults(perfMeasuresByStudy) {
		const results = [];
		for (const study of caseStudies) {
			if (study.name === BASELINE_STUDY) {
				continue;
			}

			results.push({
				study: study.name,
				...this.#privateComputePerfStats(perfMeasuresByStudy, study, 'memory', 'memory_mb_peak', 100, value =>
					Math.ceil(value)
				),
				...this.#privateComputePerfStats(perfMeasuresByStudy, study, 'time', 'duration_secs', 1, value =>
					Number(value.toPrecision(2))
				)
			});
		}
		return results;
	}
}
