export const tableProcessing = (data) => {
  const removeLeftColumn = data.map((item) => {
    return item.slice(1);
  });
  // console.log("🎯 removeLeftColumn | mediaplan:", removeLeftColumn);

  // remove header
  let marker = 0;
  for (let i = 0; i < removeLeftColumn.length; i++) {
    if (removeLeftColumn[i].length === 0 && i > 0) {
      marker = i + 1;
      break;
    }
  }
  const removedHeader = removeLeftColumn.slice(marker);
  // console.log("🎯 removedHeader | mediaplan:", removedHeader);

  //remove footer
  marker = 0;
  for (let i = 0; i < removedHeader.length; i++) {
    if (removedHeader[i].length === 0 && i > 0) {
      marker = i;
      break;
    }
  }
  const removedFooter = removedHeader.slice(0, removedHeader.length - marker);
  console.log("🎯 removedFooter | mediaplan:", removedFooter);
  const calibratedTable = calibrateTableData(removedFooter);
  marker = 0;
  const topTable = [];
  for (let i = 0; i < calibratedTable.length; i++) {
    if (
      calibratedTable[i][0] === "" &&
      calibratedTable[i][1] === "" &&
      calibratedTable[i][2] === "" &&
      calibratedTable[i][3] === ""
    ) {
      topTable.push(calibratedTable[i]);
      marker = i;
    } else {
      break;
    }
  }
  const removedTopTable = calibratedTable.slice(marker + 1);
  console.log("🎯 removedTopTable | mediaplan:", removedTopTable);
  console.log("🎯 topTable | mediaplan:", topTable);

  marker = 0;
  for (let i = 0; i < removedTopTable.length; i++) {
    if (
      removedTopTable[i][0] === "" &&
      removedTopTable[i][1] === "" &&
      removedTopTable[i][2] === "" &&
      removedTopTable[i][3] === ""
    ) {
      marker = i;
      break;
    }
  }
  const bottomTable = removedTopTable.slice(marker);
  const middleTable = removedTopTable.slice(0, marker);
  console.log("🎯 middleTable | mediaplan:", middleTable);
  console.log("🎯 bottomTable | mediaplan:", bottomTable);

  // middle table span processing
  //   const spanCoordinates = [];
  //   for (let i = 0; i < middleTable.length; i++) {
  //     let colSpan = 1;
  //     let rowSpan = 1;
  //     let rowOffset = i;

  //     for (let j = 0; j < middleTable[i].length; j++) {
  //       let colOffest = j;

  //       // skip if first cell of row is empty
  //       if (j === 0 && middleTable[i][j] === "") {
  //         continue;
  //       }

  //       // if cell is empty, skip
  //       if (middleTable[i][j] === "") {
  //         continue;
  //       }

  //       // find empty cells in the same row
  //       while (colOffest < middleTable[i].length) {
  //         colOffest++;
  //         if (middleTable[i][colOffest] === "") {
  //           colSpan++;
  //         } else {
  //           break;
  //         }
  //       }

  //       //find empty cells in the same column
  //       while (rowOffset < middleTable.length) {
  //         rowOffset++;
  //         if (middleTable[rowOffset][j] === "") {
  //           rowSpan++;
  //         } else {
  //           break;
  //         }
  //       }

  //       spanCoordinates.push({
  //         row: i,
  //         col: j,
  //         rowSpan: rowSpan,
  //         colSpan: colSpan,
  //       });
  //     }
  //   }

  return { topTable, middleTable, bottomTable };
};

export function detectSpans(data) {
  const spanCoordinates = [];
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      let colSpan = 1;
      let rowSpan = 1;
      let rowOffset = i;
      let colOffset = j;

      // skip if first cell of row is empty
      if (j === 0 && data[i][j] === "") {
        continue;
      }

      // if cell is empty, skip
      if (data[i][j] === "") {
        continue;
      }

      // find empty cells in the same row
      while (colOffset < data[i].length) {
        colOffset++;
        if (colOffset < data[i].length && data[i][colOffset] === "") {
          colSpan++;
        } else {
          break;
        }
      }

      //find empty cells in the same column
      while (rowOffset < data.length) {
        rowOffset++;
        if (rowOffset < data.length && data[rowOffset][j] === "") {
          rowSpan++;
        } else {
          break;
        }
      }

      spanCoordinates.push({
        row: i,
        col: j,
        rowSpan: rowSpan,
        colSpan: colSpan,
        value: data[i][j],
      });
    }
  }
  return spanCoordinates;
}

const calibrateTableData = (data) => {
  let maxLength = 0;
  for (let i = 0; i < data.length; i++) {
    if (data[i].length > maxLength) {
      maxLength = data[i].length;
    }
  }

  // console.log("🎯 maxLength | mediaplan:", maxLength);

  const calibratedData = [];
  for (let i = 0; i < data.length; i++) {
    const calibratedRow = [];
    for (let j = 0; j < maxLength; j++) {
      if (j < data[i].length) {
        calibratedRow.push(data[i][j]);
      } else {
        calibratedRow.push("");
      }
    }
    calibratedData.push(calibratedRow);
  }
  return calibratedData;
};
