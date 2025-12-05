import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type Props = {
  passed: number;
  incomplete: number;
};

export default function ProgressPieChart({ passed, incomplete }: Props) {
  const data = [
    { name: "Passed", value: passed },
    { name: "Incomplete", value: incomplete },
  ];

  // Passed uses gradient via <defs>, incomplete is solid orange
  const COLORS = ["url(#passedGradient)", "#ffa157"];

  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <PieChart>
          {/* define gradient fills */}
          <defs>
            <linearGradient id="passedGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#b8f1cc" />
              <stop offset="100%" stopColor="#88cfc3" />
            </linearGradient>
          </defs>

          <Pie
            data={data}
            cx="50%"
            cy="50%"
            label={false}        // no numbers/labels on slices
            outerRadius={80}
            dataKey="value"
          >
            {data.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={COLORS[idx]} />
            ))}
          </Pie>

          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
