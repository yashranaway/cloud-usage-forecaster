import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { readdir } from 'fs/promises';
import { join } from 'path';

const app = new Hono();

// Serve static files from public directory
  app.use('/static/*', serveStatic({ root: './' }));
  app.use('/output/*', serveStatic({ root: './' }));

// API endpoint to get CSV data
app.get('/api/data', async (c) => {
  try {
    const file = Bun.file('./output/processed_data.csv');
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      return c.json({ error: 'No data found' }, 404);
    }
    
    const headers = lines[0].split(',');
    
    // Parse first 1000 rows for performance
    const data = lines.slice(1, 1001).map(line => {
      const values = line.split(',');
      const obj: any = {};
      headers.forEach((header, i) => {
        obj[header] = values[i];
      });
      return obj;
    }).filter(row => row.Timestamp);
    
    return c.json({ data, count: data.length });
  } catch (error) {
    return c.json({ error: 'Failed to load data' }, 500);
  }
});

// API endpoint to get available visualizations
app.get('/api/visualizations', async (c) => {
  try {
    const files = await readdir('./output');
    const images = files.filter(f => f.endsWith('.png')).map(f => ({
      name: f.replace('.png', '').replace(/_/g, ' ').toUpperCase(),
      path: `/output/${f}`
    }));
    return c.json({ images });
  } catch (error) {
    return c.json({ error: 'Failed to load visualizations' }, 500);
  }
});

// API endpoint to check model status
app.get('/api/models/status', async (c) => {
  try {
    const files = await readdir('./output');
    
    const models = [
      {
        name: 'ARIMA',
        description: 'AutoRegressive Integrated Moving Average',
        file: 'models/arima_model.py',
        output: 'arima_act_pred.png',
        status: files.includes('arima_act_pred.png') ? 'completed' : 'not_run',
        useCase: 'Time series forecasting for CPU trends'
      },
      {
        name: 'LSTM',
        description: 'Long Short-Term Memory Neural Network',
        file: 'models/lstm_model.py',
        output: 'lstm_act_pred.png',
        status: files.includes('lstm_act_pred.png') ? 'completed' : 'not_run',
        useCase: 'Deep learning for sequential pattern recognition'
      },
      {
        name: 'DeepAR',
        description: 'Probabilistic Forecasting with RNN',
        file: 'models/deepar_model.py',
        output: 'deepar_pred.png',
        status: files.includes('deepar_pred.png') ? 'completed' : 'not_run',
        useCase: 'Uncertainty quantification in predictions'
      }
    ];
    
    return c.json({ models });
  } catch (error) {
    return c.json({ error: 'Failed to check model status' }, 500);
  }
});

// API endpoint to run a model
app.post('/api/models/run/:modelName', async (c) => {
  const modelName = c.req.param('modelName');
  const modelMap: Record<string, string> = {
    'arima': 'backend/models/arima_model.py',
    'lstm': 'backend/models/lstm_model.py',
    'deepar': 'backend/models/deepar_model.py'
  };
  
  const modelFile = modelMap[modelName.toLowerCase()];
  if (!modelFile) {
    return c.json({ error: 'Model not found' }, 404);
  }
  
  try {
    // Use virtual environment Python if available, otherwise python3
    const pythonPath = 'backend/.venv/bin/python';
    const fs = require('fs');
    const pythonCmd = fs.existsSync(pythonPath) ? pythonPath : 'python3';
    
    const proc = Bun.spawn([pythonCmd, modelFile], {
      cwd: process.cwd(),
      stdout: 'pipe',
      stderr: 'pipe'
    });
    
    const output = await new Response(proc.stdout).text();
    const error = await new Response(proc.stderr).text();
    
    await proc.exited;
    
    return c.json({ 
      model: modelName,
      status: 'completed',
      output: output.slice(-500), // Last 500 chars
      error: error ? error.slice(-500) : null
    });
  } catch (error) {
    return c.json({ 
      error: 'Failed to run model', 
      details: String(error)
    }, 500);
  }
});

// API endpoint to get model predictions data
app.get('/api/models/predictions', async (c) => {
  try {
    const files = await readdir('./output');
    const predictions = files
      .filter(f => f.includes('pred') || f.includes('comparison'))
      .map(f => ({
        name: f.replace('.png', '').replace(/_/g, ' ').toUpperCase(),
        path: `/output/${f}`,
        type: f.includes('arima') ? 'ARIMA' : f.includes('lstm') ? 'LSTM' : 'DeepAR'
      }));
    
    return c.json({ predictions });
  } catch (error) {
    return c.json({ error: 'Failed to load predictions' }, 500);
  }
});

// Serve main HTML page
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cloud Usage Forecaster</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #ffffff;
      color: #000000;
      line-height: 1.6;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }
    
    header {
      border-bottom: 2px solid #000;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    h1 {
      font-size: 32px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    
    h2 {
      font-size: 20px;
      font-weight: 600;
      margin: 30px 0 15px 0;
      border-bottom: 1px solid #000;
      padding-bottom: 8px;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 30px;
    }
    
    .stat-card {
      border: 1px solid #000;
      padding: 15px;
    }
    
    .stat-label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    
    .stat-value {
      font-size: 28px;
      font-weight: 700;
    }
    
    .chart-container {
      border: 1px solid #000;
      padding: 20px;
      margin-bottom: 20px;
      background: #ffffff;
    }
    
    canvas {
      max-width: 100%;
      height: auto;
    }
    
    .viz-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    
    .viz-card {
      border: 1px solid #000;
      overflow: hidden;
    }
    
    .viz-card img {
      width: 100%;
      height: auto;
      display: block;
      border-bottom: 1px solid #000;
    }
    
    .viz-title {
      padding: 10px 15px;
      font-size: 14px;
      font-weight: 600;
      background: #000;
      color: #fff;
    }
    
    .loading {
      text-align: center;
      padding: 40px;
      font-size: 14px;
    }
    
    .tabs {
      display: flex;
      gap: 0;
      border-bottom: 2px solid #000;
      margin-bottom: 20px;
    }
    
    .tab {
      padding: 12px 24px;
      background: #fff;
      border: 1px solid #000;
      border-bottom: none;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      margin-bottom: -2px;
    }
    
    .tab.active {
      background: #000;
      color: #fff;
    }
    
    .tab-content {
      display: none;
    }
    
    .tab-content.active {
      display: block;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Cloud Usage Forecaster</h1>
      <p>Cloud Computing Resource Usage Analysis</p>
    </header>
    
    <div class="stats-grid" id="stats"></div>
    
    <div class="tabs">
      <div class="tab active" onclick="switchTab('charts')">CHARTS</div>
      <div class="tab" onclick="switchTab('visualizations')">ANALYTICS</div>
      <div class="tab" onclick="switchTab('models')">MODELS</div>
      <div class="tab" onclick="switchTab('data')">DATA</div>
    </div>
    
    <div id="charts" class="tab-content active">
      <h2>CPU Usage Analysis</h2>
      <div class="chart-container">
        <canvas id="cpuChart"></canvas>
      </div>
      
      <h2>Memory Usage Analysis</h2>
      <div class="chart-container">
        <canvas id="memoryChart"></canvas>
      </div>
      
      <h2>Network Throughput</h2>
      <div class="chart-container">
        <canvas id="networkChart"></canvas>
      </div>
    </div>
    
    <div id="models" class="tab-content">
      <h2>ML Model Demonstrations</h2>
      
      <div id="modelsList" class="chart-container" style="margin-bottom: 20px;">
        <div class="loading">Loading model status...</div>
      </div>
      
      <h2>Model Predictions</h2>
      <div id="predictionsGrid" class="viz-grid"></div>
    </div>
    
    <div id="visualizations" class="tab-content">
      <h2>Advanced Analytics</h2>
      
      <div class="chart-container">
        <h3 style="margin-bottom: 15px; font-size: 16px; font-weight: 600;">CPU Usage Distribution</h3>
        <canvas id="cpuHistogram"></canvas>
      </div>
      
      <div class="chart-container">
        <h3 style="margin-bottom: 15px; font-size: 16px; font-weight: 600;">Resource Correlation</h3>
        <canvas id="scatterChart"></canvas>
      </div>
      
      <div class="chart-container">
        <h3 style="margin-bottom: 15px; font-size: 16px; font-weight: 600;">Disk I/O Throughput</h3>
        <canvas id="diskChart"></canvas>
      </div>
      
      <div class="chart-container">
        <h3 style="margin-bottom: 15px; font-size: 16px; font-weight: 600;">Daily CPU Usage Pattern</h3>
        <canvas id="dailyPattern"></canvas>
      </div>
    </div>
    
    <div id="data" class="tab-content">
      <h2>Raw Data Preview</h2>
      <div class="chart-container">
        <div id="dataTable" style="overflow-x: auto;"></div>
      </div>
    </div>
  </div>
  
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <script>
    let chartData = null;
    
    // Professional color palette
    const colors = {
      primary: '#2563eb',      // Blue
      secondary: '#7c3aed',    // Purple
      success: '#10b981',      // Green
      warning: '#f59e0b',      // Orange
      danger: '#ef4444',       // Red
      info: '#06b6d4',         // Cyan
      dark: '#1f2937',         // Dark gray
      gradient1: '#3b82f6',    // Light blue
      gradient2: '#8b5cf6'     // Light purple
    };
    
    function switchTab(tabName) {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      event.target.classList.add('active');
      document.getElementById(tabName).classList.add('active');
    }
    
    async function loadData() {
      try {
        const response = await fetch('/api/data');
        const result = await response.json();
        chartData = result.data;
        
        updateStats(chartData);
        createCharts(chartData);
        createAdvancedCharts(chartData);
        createDataTable(chartData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    }
    
    function createAdvancedCharts(data) {
      // CPU Histogram - calculate correct percentages
      const cpuValues = data.map(d => {
        const usage = parseFloat(d['CPU usage [MHZ]']);
        const capacity = parseFloat(d['CPU capacity provisioned [MHZ]']);
        return capacity > 0 ? (usage / capacity) * 100 : 0;
      }).filter(v => !isNaN(v) && v > 0);
      const cpuBuckets = createHistogram(cpuValues, 20);
      
      new Chart(document.getElementById('cpuHistogram'), {
        type: 'bar',
        data: {
          labels: cpuBuckets.labels,
          datasets: [{
            label: 'Frequency',
            data: cpuBuckets.values,
            backgroundColor: colors.primary,
            borderColor: colors.primary,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { 
              beginAtZero: true,
              title: { display: true, text: 'Frequency', color: '#000' },
              grid: { color: '#e0e0e0' }
            },
            x: { 
              title: { display: true, text: 'CPU Usage (%)', color: '#000' },
              grid: { display: false }
            }
          }
        }
      });
      
      // Scatter Plot: CPU vs Memory
      const scatterData = data.slice(0, 200).map(d => {
        const usage = parseFloat(d['CPU usage [MHZ]']);
        const capacity = parseFloat(d['CPU capacity provisioned [MHZ]']);
        const cpuPercent = capacity > 0 ? (usage / capacity) * 100 : 0;
        return {
        x: cpuPercent,
        y: parseFloat(d['Memory usage [KB]']) / 1024 / 1024
      }}).filter(p => !isNaN(p.x) && !isNaN(p.y) && p.x > 0);
      
      new Chart(document.getElementById('scatterChart'), {
        type: 'scatter',
        data: {
          datasets: [{
            label: 'CPU vs Memory',
            data: scatterData,
            backgroundColor: colors.warning,
            borderColor: colors.warning,
            pointRadius: 3,
            pointHoverRadius: 5
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { 
              title: { display: true, text: 'Memory Usage (GB)', color: '#000' },
              grid: { color: '#e0e0e0' }
            },
            x: { 
              title: { display: true, text: 'CPU Usage (%)', color: '#000' },
              grid: { color: '#e0e0e0' }
            }
          }
        }
      });
      
      // Disk I/O Chart
      const diskLabels = data.slice(0, 100).map(d => d.Timestamp?.split(' ')[1] || '');
      new Chart(document.getElementById('diskChart'), {
        type: 'line',
        data: {
          labels: diskLabels,
          datasets: [
            {
              label: 'Read (KB/s)',
              data: data.slice(0, 100).map(d => parseFloat(d['Disk read throughput [KB/s]'])),
              borderColor: colors.danger,
              backgroundColor: colors.danger + '20',
              borderWidth: 2,
              pointRadius: 0,
              tension: 0.1
            },
            {
              label: 'Write (KB/s)',
              data: data.slice(0, 100).map(d => parseFloat(d['Disk write throughput [KB/s]'])),
              borderColor: colors.gradient2,
              backgroundColor: colors.gradient2 + '20',
              borderWidth: 2,
              pointRadius: 0,
              tension: 0.1
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { 
              display: true,
              labels: { color: '#000' }
            }
          },
          scales: {
            y: { 
              beginAtZero: true,
              grid: { color: '#e0e0e0' }
            },
            x: { 
              grid: { display: false }
            }
          }
        }
      });
      
      // Daily Pattern - Average CPU by hour
      const hourlyData = aggregateByHour(data);
      new Chart(document.getElementById('dailyPattern'), {
        type: 'bar',
        data: {
          labels: hourlyData.labels,
          datasets: [{
            label: 'Avg CPU Usage %',
            data: hourlyData.values,
            backgroundColor: colors.gradient1,
            borderColor: colors.gradient1,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { 
              beginAtZero: true,
              title: { display: true, text: 'CPU Usage (%)', color: '#000' },
              grid: { color: '#e0e0e0' }
            },
            x: { 
              title: { display: true, text: 'Hour of Day', color: '#000' },
              grid: { display: false }
            }
          }
        }
      });
    }
    
    function createHistogram(values, buckets) {
      const min = Math.min(...values);
      const max = Math.max(...values);
      const bucketSize = (max - min) / buckets;
      const histogram = new Array(buckets).fill(0);
      const labels = [];
      
      for (let i = 0; i < buckets; i++) {
        const rangeStart = (min + i * bucketSize).toFixed(0);
        const rangeEnd = (min + (i + 1) * bucketSize).toFixed(0);
        labels.push(\`\${rangeStart}-\${rangeEnd}\`);
      }
      
      values.forEach(v => {
        const bucketIndex = Math.min(Math.floor((v - min) / bucketSize), buckets - 1);
        histogram[bucketIndex]++;
      });
      
      return { labels, values: histogram };
    }
    
    function aggregateByHour(data) {
      const hourlyMap = new Map();
      
      data.forEach(d => {
        const timestamp = d.Timestamp;
        if (!timestamp) return;
        
        const hour = timestamp.split(' ')[1]?.split(':')[0];
        if (!hour) return;
        
        const usage = parseFloat(d['CPU usage [MHZ]']);
        const capacity = parseFloat(d['CPU capacity provisioned [MHZ]']);
        if (isNaN(usage) || isNaN(capacity) || capacity === 0) return;
        const cpuUsage = (usage / capacity) * 100;
        
        if (!hourlyMap.has(hour)) {
          hourlyMap.set(hour, []);
        }
        hourlyMap.get(hour).push(cpuUsage);
      });
      
      const labels = [];
      const values = [];
      
      for (let h = 0; h < 24; h++) {
        const hourStr = h.toString().padStart(2, '0');
        labels.push(hourStr + ':00');
        
        const hourData = hourlyMap.get(hourStr);
        if (hourData && hourData.length > 0) {
          const avg = hourData.reduce((a, b) => a + b, 0) / hourData.length;
          values.push(avg);
        } else {
          values.push(0);
        }
      }
      
      return { labels, values };
    }
    
    function updateStats(data) {
      // Calculate correct CPU percentage from MHZ values
      const cpuPercentages = data.map(d => {
        const usage = parseFloat(d['CPU usage [MHZ]']);
        const capacity = parseFloat(d['CPU capacity provisioned [MHZ]']);
        return capacity > 0 ? (usage / capacity) * 100 : 0;
      }).filter(v => !isNaN(v) && v > 0);
      
      const memoryUsage = data.map(d => parseFloat(d['Memory usage [KB]'])).filter(v => !isNaN(v));
      
      const avgCPU = (cpuPercentages.reduce((a, b) => a + b, 0) / cpuPercentages.length).toFixed(2);
      const maxCPU = Math.max(...cpuPercentages).toFixed(2);
      const avgMemory = (memoryUsage.reduce((a, b) => a + b, 0) / memoryUsage.length / 1024 / 1024).toFixed(2);
      const dataPoints = data.length;
      
      document.getElementById('stats').innerHTML = \`
        <div class="stat-card">
          <div class="stat-label">Avg CPU Usage</div>
          <div class="stat-value">\${avgCPU}%</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Max CPU Usage</div>
          <div class="stat-value">\${maxCPU}%</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Avg Memory (GB)</div>
          <div class="stat-value">\${avgMemory}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Data Points</div>
          <div class="stat-value">\${dataPoints}</div>
        </div>
      \`;
    }
    
    function createCharts(data) {
      const labels = data.slice(0, 100).map(d => d.Timestamp?.split(' ')[1] || '');
      
      // CPU Chart
      new Chart(document.getElementById('cpuChart'), {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'CPU Usage %',
            data: data.slice(0, 100).map(d => {
              const usage = parseFloat(d['CPU usage [MHZ]']);
              const capacity = parseFloat(d['CPU capacity provisioned [MHZ]']);
              return capacity > 0 ? (usage / capacity) * 100 : 0;
            }),
            borderColor: colors.primary,
            backgroundColor: colors.primary + '20',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { 
              beginAtZero: true,
              grid: { color: '#e0e0e0' }
            },
            x: { 
              grid: { display: false }
            }
          }
        }
      });
      
      // Memory Chart
      new Chart(document.getElementById('memoryChart'), {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Memory Usage (GB)',
            data: data.slice(0, 100).map(d => parseFloat(d['Memory usage [KB]']) / 1024 / 1024),
            borderColor: colors.secondary,
            backgroundColor: colors.secondary + '20',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { 
              beginAtZero: true,
              grid: { color: '#e0e0e0' }
            },
            x: { 
              grid: { display: false }
            }
          }
        }
      });
      
      // Network Chart
      new Chart(document.getElementById('networkChart'), {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Received (KB/s)',
              data: data.slice(0, 100).map(d => parseFloat(d['Network received throughput [KB/s]'])),
              borderColor: colors.success,
              backgroundColor: colors.success + '20',
              borderWidth: 2,
              pointRadius: 0,
              tension: 0.1
            },
            {
              label: 'Transmitted (KB/s)',
              data: data.slice(0, 100).map(d => parseFloat(d['Network transmitted throughput [KB/s]'])),
              borderColor: colors.info,
              backgroundColor: colors.info + '20',
              borderWidth: 2,
              pointRadius: 0,
              tension: 0.1
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { 
              display: true,
              labels: { color: '#000' }
            }
          },
          scales: {
            y: { 
              beginAtZero: true,
              grid: { color: '#e0e0e0' }
            },
            x: { 
              grid: { display: false }
            }
          }
        }
      });
    }
    
    function createDataTable(data) {
      const headers = Object.keys(data[0]);
      const rows = data.slice(0, 50);
      
      const table = \`
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background: #000; color: #fff;">
              \${headers.map(h => \`<th style="padding: 8px; text-align: left; border: 1px solid #000;">\${h}</th>\`).join('')}
            </tr>
          </thead>
          <tbody>
            \${rows.map(row => \`
              <tr style="border-bottom: 1px solid #e0e0e0;">
                \${headers.map(h => \`<td style="padding: 8px; border: 1px solid #e0e0e0;">\${row[h] || ''}</td>\`).join('')}
              </tr>
            \`).join('')}
          </tbody>
        </table>
      \`;
      
      document.getElementById('dataTable').innerHTML = table;
    }
    
    async function loadModels() {
      try {
        const response = await fetch('/api/models/status');
        const result = await response.json();
        const container = document.getElementById('modelsList');
        
        container.innerHTML = result.models.map(model => \`
          <div style="border: 1px solid #000; padding: 20px; margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
              <div>
                <h3 style="margin: 0 0 5px 0; font-size: 18px; font-weight: 700;">\${model.name}</h3>
                <p style="margin: 0 0 5px 0; font-size: 14px; color: #333;">\${model.description}</p>
                <p style="margin: 0; font-size: 12px; font-style: italic;">Use Case: \${model.useCase}</p>
              </div>
              <div style="text-align: right;">
                <div style="display: inline-block; padding: 5px 10px; border: 1px solid #000; font-size: 12px; font-weight: 600; margin-bottom: 10px;">
                  \${model.status === 'completed' ? '✓ COMPLETED' : '○ NOT RUN'}
                </div>
                <br>
                <button 
                  onclick="runModel('\${model.name.toLowerCase()}')"
                  style="padding: 8px 16px; background: #000; color: #fff; border: none; cursor: pointer; font-size: 12px; font-weight: 600;"
                  id="btn-\${model.name.toLowerCase()}"
                >
                  RUN MODEL
                </button>
              </div>
            </div>
            <div style="font-size: 11px; color: #666; margin-top: 10px;">
              File: \${model.file}
            </div>
            <div id="output-\${model.name.toLowerCase()}" style="margin-top: 10px; padding: 10px; background: #f5f5f5; font-family: monospace; font-size: 11px; display: none; max-height: 150px; overflow-y: auto;"></div>
          </div>
        \`).join('');
        
        // Load predictions
        loadPredictions();
      } catch (error) {
        console.error('Error loading models:', error);
      }
    }
    
    async function runModel(modelName) {
      const button = document.getElementById(\`btn-\${modelName}\`);
      const output = document.getElementById(\`output-\${modelName}\`);
      
      button.textContent = 'RUNNING...';
      button.disabled = true;
      output.style.display = 'block';
      output.textContent = 'Model execution started...\\n';
      
      try {
        const response = await fetch(\`/api/models/run/\${modelName}\`, {
          method: 'POST'
        });
        const result = await response.json();
        
        if (result.error) {
          output.textContent = 'Error: ' + result.error + '\\n' + (result.details || '');
          output.style.color = '#cc0000';
        } else {
          output.textContent = 'Model executed successfully!\\n\\nOutput:\\n' + result.output;
          output.style.color = '#000';
          
          // Reload models and predictions
          setTimeout(() => {
            loadModels();
          }, 1000);
        }
      } catch (error) {
        output.textContent = 'Error running model: ' + error;
        output.style.color = '#cc0000';
      } finally {
        button.textContent = 'RUN MODEL';
        button.disabled = false;
      }
    }
    
    async function loadPredictions() {
      try {
        const response = await fetch('/api/models/predictions');
        const result = await response.json();
        const grid = document.getElementById('predictionsGrid');
        
        if (result.predictions.length === 0) {
          grid.innerHTML = '<div class="loading">No predictions available yet. Run the models above to generate predictions.</div>';
          return;
        }
        
        grid.innerHTML = result.predictions.map(pred => \`
          <div class="viz-card">
            <div class="viz-title">\${pred.type} - \${pred.name}</div>
            <img src="\${pred.path}" alt="\${pred.name}" loading="lazy">
          </div>
        \`).join('');
      } catch (error) {
        console.error('Error loading predictions:', error);
      }
    }
    
    // Load data on page load
    loadData();
    loadModels();
  </script>
</body>
</html>
  `);
});

const portFromEnv = Number(process.env.PORT || 3000);
console.log(`Server starting on http://localhost:${portFromEnv}`);

export default {
  port: portFromEnv,
  fetch: app.fetch,
};