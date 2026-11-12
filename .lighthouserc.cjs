// Lighthouse CI runs the built site on an emulated mobile device.
// Thresholds are warnings initially: gather a baseline before enforcing targets.
module.exports={
  ci:{
    collect:{
      startServerCommand:'npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
      startServerReadyPattern:'Local:',
      url:['http://127.0.0.1:4173/','http://127.0.0.1:4173/games/'],
      numberOfRuns:1,
      settings:{chromeFlags:'--headless --no-sandbox --disable-dev-shm-usage'}
    },
    assert:{
      assertions:{
        'categories:performance':['warn',{minScore:0.7}],
        'categories:accessibility':['warn',{minScore:0.8}],
        'largest-contentful-paint':['warn',{maxNumericValue:4000}],
        'cumulative-layout-shift':['warn',{maxNumericValue:0.15}]
      }
    },
    upload:{target:'filesystem',outputDir:'./lhci-results'}
  }
};
