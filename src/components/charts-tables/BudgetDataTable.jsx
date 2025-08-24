const BudgetDataTable = ({ channelData, totalData, metrics, formatValue }) => {
  return (
    <div className="overflow-auto">
      <h2 className="text-lg font-semibold mb-2">Budget</h2>
      <table className="min-w-max table-auto border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-3 py-2 border">Channel</th>
            {metrics.map((metric) => (
              <th key={metric} className="px-3 py-2 border text-right">
                {metric === "SpentPercent"
                  ? "%Spent"
                  : metric === "RemainingBudget"
                  ? "Remaining Budget"
                  : metric}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(channelData)
            .sort(([, a], [, b]) => b["Conversions"] - a["Conversions"])
            .map(([channel, values]) => (
              <tr key={channel} className="hover:bg-gray-100">
                <td className="px-3 py-2 border">{channel}</td>
                {metrics.map((metric) => (
                  <td key={metric} className="px-3 py-2 border text-right">
                    {formatValue(values[metric], metric)}
                  </td>
                ))}
              </tr>
            ))}
          {Object.keys(totalData).length > 0 && (
            <tr className="bg-gray-200 font-semibold">
              <td className="px-3 py-2 border">Total</td>
              {metrics.map((metric) => (
                <td key={metric} className="px-3 py-2 border text-right">
                  {formatValue(totalData[metric], metric)}
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BudgetDataTable;
