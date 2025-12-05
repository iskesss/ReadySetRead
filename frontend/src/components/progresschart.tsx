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


  const COLORS = ["url(#passedGradient)", "#ffa157"];

  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <PieChart>

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
            label={false}
            outerRadius={80}
            dataKey="value"
          >
            {data.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx]} />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{
              backgroundColor: "#fef6e4",
              border: "1px solid #ddd",
              borderRadius: 8,
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
            }}
            itemStyle={{
              color: "#1E1B4B",
              fontWeight: 600,
              fontSize: "1.1rem",
            }}
          />

          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
