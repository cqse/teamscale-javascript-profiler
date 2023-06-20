use std::collections::HashMap;
use std::io;
use std::io::Write;
use std::sync::Mutex;
use std::time::{Duration, Instant};
use lazy_static::lazy_static;

lazy_static! {
    static ref PERF_COUNTER: Mutex<PerformanceCounter> = Mutex::new(PerformanceCounter::new());
}

struct PerformanceCounter {
    counters: HashMap<String, Duration>,
}

impl PerformanceCounter {
    fn new() -> PerformanceCounter {
        PerformanceCounter {
            counters: HashMap::new(),
        }
    }

    fn start(&self) -> Instant {
        Instant::now()
    }

    fn end(&mut self, name: &str, start: Instant) {
        let elapsed = start.elapsed();
        let counter = self.counters.entry(name.to_string()).or_insert_with(|| Duration::new(0, 0));
        *counter += elapsed;
    }

    fn add_duration(&mut self, name: &str, duration: Duration) {
        let counter = self.counters.entry(name.to_string()).or_insert_with(|| Duration::new(0, 0));
        *counter += duration;
    }

    fn report(&self) {
        let mut total_duration = Duration::new(0, 0);

        for (_, time) in &self.counters {
            total_duration += *time;
        }

        if total_duration > Duration::new(10, 0) {
            let stdout = io::stdout();
            let mut handle = stdout.lock();
            writeln!(handle, "Performance Counters:").unwrap();
            for (name, time) in &self.counters {
                writeln!(handle, "\t {}: {:?}", name, time).unwrap();
            }

            handle.flush().unwrap();
        }
    }
}

pub fn start() -> Instant {
    PERF_COUNTER.lock().unwrap().start()
}

pub fn end(name: &str, start: Instant) {
    PERF_COUNTER.lock().unwrap().end(name, start)
}

pub fn report() {
    PERF_COUNTER.lock().unwrap().report()
}

pub struct ScopedPerformanceCounter {
    name: String,
    start: Instant,
}

impl ScopedPerformanceCounter {
    pub fn new(name: &str) -> ScopedPerformanceCounter {
        ScopedPerformanceCounter {
            name: name.to_string(),
            start: Instant::now(),
        }
    }
}

impl Drop for ScopedPerformanceCounter {
    fn drop(&mut self) {
        let elapsed = self.start.elapsed();
        PERF_COUNTER.lock().unwrap().add_duration(&self.name, elapsed);
    }
}

#[macro_export]
macro_rules! measure_function {
    ($fn_name:ident($($arg:ident: $t:ty),*) -> $r:ty, $body:block) => {
        fn $fn_name($($arg: $t),*) -> $r {
            let start = std::time::Instant::now();
            let result = (|| $body)();
            $crate::PERF_COUNTER.lock().unwrap().end(stringify!($fn_name), start);
            result
        }
    };
}