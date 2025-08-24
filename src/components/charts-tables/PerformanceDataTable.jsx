const PerformanceDataTable = ({
  channelData,
  totalData,
  metrics,
  formatValue,
}) => {
  return (
    <table className="min-w-max table-auto border border-gray-300 text-[12px]">
      <thead>
        <tr className="bg-gray-200">
          <th className="px-2 py-1 border">Channel</th>
          {metrics.map((metric) => (
            <th key={metric} className="px-2 py-1 border text-right">
              {metric === "ctr"
                ? "%CTR"
                : metric === "conRate"
                ? "%Con Rate"
                : metric === "cpl"
                ? "CPL"
                : metric}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Object.entries(channelData)
          .sort(([, a], [, b]) => b["Conversions"] - a["Conversions"])
          .slice(0, 5)
          .map(([channel, values]) => (
            <tr key={channel} className="hover:bg-gray-100">
              <td className="px-2 py-1 border">{channel}</td>
              {metrics.map((metric) => (
                <td key={metric} className="px-2 py-1 border text-right">
                  {formatValue(values[metric], metric)}
                </td>
              ))}
            </tr>
          ))}
        {Object.keys(totalData).length > 0 && (
          <tr className="bg-gray-200 font-semibold">
            <td className="px-2 py-1 border">Total</td>
            {metrics.map((metric) => (
              <td key={metric} className="px-2 py-1 border text-right">
                {formatValue(totalData[metric], metric)}
              </td>
            ))}
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default PerformanceDataTable;
