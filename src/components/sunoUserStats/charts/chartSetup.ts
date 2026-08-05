import {
  Chart,
  BarController, LineController, ScatterController,
  BarElement, LineElement, PointElement,
  CategoryScale, LinearScale, TimeScale,
  Tooltip, Legend, Title, Filler,
} from 'chart.js';

import 'chartjs-adapter-date-fns';

Chart.register(
  BarController, LineController, ScatterController,
  BarElement, LineElement, PointElement,
  CategoryScale, LinearScale, TimeScale,
  Tooltip, Legend, Title, Filler,
);
