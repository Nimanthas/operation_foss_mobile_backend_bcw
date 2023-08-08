const { pool } = require('../dbconfig');
const moment = require('moment');
const XLSX = require('xlsx');
const configData = require('../../common/config.list');

// Export an asynchronous function that takes request and response objects as arguments
module.exports = async (req, res) => {
  // Extract parameters and files from the request object
  const { params, files } = req;
  const { fabyyid, sizetempid } = params;

  try {
    // Check if the file parameter is missing from the request
    if (!files?.file) {
      throw new Error('no files were found in request.');
    }

    //Return sucess response
    return res.status(200).json({ type: "SUCCESS", message: ``, data: [] });
  } catch (error) {
    //Return error
    return res.status(200).json({ type: "ERROR", message: String(error), action: 'RETRY' });
  }
};

//Read excel from headers
async function readExcelToJson(fileData, config) {
  try {
    // Destructuring config object and setting default value for mandatoryKeys
    const { mandatoryKeys = [], sections, headerKeys, blankRows, sheetNumber } = config;
    let { sheetName } = config;

    // Reading workbook from fileData
    const workbook = XLSX.read(fileData);

    // Getting sheet with sheetName from workbook
    if (sheetName == 'number') { sheetName = workbook?.SheetNames[sheetNumber] }
    const sheet = workbook?.Sheets[sheetName];
    //console.log('sheet: ', sheet);

    // If sheet with sheetName not found, throw error
    if (!sheet) {
      throw new Error(`No sheet found with name ${sheetName}`);
    }

    // Converting sheet to json data
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: blankRows });
    //console.log('data[0]: ', data[0]);

    // If no data found in sheet, throw error
    if (!data?.length) {
      throw new Error(`No data found in sheet with name ${sheetName}`);
    }

    // Finding header row using headerKeys
    let headerRow = -1;
    for (const [index, row] of data.entries()) {
      if (headerKeys.every(name => row.includes(name))) {
        headerRow = index;
        break;
      }
    }

    // If header row not found, throw error
    if (headerRow === -1) {
      throw new Error('Header row not found');
    }

    // Getting header row data, section row data and data rows
    const headerRowData = data[headerRow];
    const sectionRow = headerRow <= 0 ? [] : data[headerRow - 1];
    const dataRows = data.slice(headerRow + 1);

    // Converting data rows to json object
    const jsonData = [];
    for (const row of dataRows) {
      const obj = {};
      let sectionName = '';
      for (const [index, header] of headerRowData.entries()) {
        // Concatenate section name and header name as key
        if (sections) {
          if (sectionRow[index] != undefined && sectionRow[index] != '') { sectionName = sectionRow[index] };
          //console.log('sectionRow[index]: , sectionName:, sections: ', sectionRow[index], sectionName, sections);
          obj[sectionName + "::" + header] = row[index];
        } else {
          obj[header] = row[index];
        }
      }
      jsonData.push(obj);
    }
    //console.log('jsonData: ', jsonData);

    // Checking for missing mandatory keys and throwing error if any
    const missingKeys = mandatoryKeys.filter(key => !jsonData.some(obj => obj.hasOwnProperty(key)));
    if (missingKeys.length > 0) {
      throw new Error(`The mandatory columns are missing in excel. Missing columns: ${missingKeys.join(', ')}`);
    }

    //console.log('jsonData[0]: ', jsonData[0]);
    // Returning json data
    return jsonData;
  } catch (error) {
    // Throwing error with custom message
    throw new Error(error.message);
  }
}
//Transform excel json output into standard pre-defined json
function transformArray(inputArray, config, filterValue) {
  try {
    const { outputModel, fieldMappings, groupingSpec, arrayKeySpecs, mergeKeys, filterKey, concatenateKeys, filterValueQtyRecords } = config;

    //Transform filter value
    filterValue = filterValue?.toLowerCase().trim();

    //console.log('inputArray[0]: ', inputArray[0]);
    // Transform array with transformations
    const outputArray = inputArray
      .filter(inputObj => String(inputObj[filterKey])?.toLowerCase().trim() === filterValue)
      .map(inputObj => {
        // Rename fields
        const outputObj = {};
        let validRow = true;
        Object.entries(inputObj).forEach(async ([inputKey, inputValue]) => {
          const mapping = fieldMappings?.find(m => m.inputKey === inputKey);
          const outputKey = mapping ? mapping.outputKey : inputKey;
          const config = mapping ? mapping.config : undefined;
          let outputValue = inputValue;
          if (config) {
            if (config?.quantitycolumn && filterValueQtyRecords != null && !isNaN(filterValueQtyRecords)) {
              if (Number(outputValue) != "NaN" && Number(outputValue) == filterValueQtyRecords) {
                validRow = false;
              }
            }
            if (config?.split && inputValue != undefined) {
              outputValue = String(inputValue).split(config.split);
            }
            if (config?.sub && inputValue != undefined) {
              let textprocesser = String(inputValue);
              let len = textprocesser.length;
              if (config?.sub?.option == 'init') {
                outputValue = textprocesser.substring(config?.sub?.numberofletters);
              } else if (config?.sub?.option == 'last') {
                outputValue = textprocesser.substring(len - config?.sub?.numberofletters);
              } else if (config?.sub?.option == 'mid') {
                outputValue = textprocesser.substring(config?.sub?.startnumber, config?.sub?.start + config?.sub?.numberofletters);
              } else if (config?.sub?.option == 'find') {
                let position = textprocesser.indexOf(config?.sub?.findchar);
                outputValue = position > 0 ? textprocesser.substring(position, position + config?.sub?.numberofletters) : '';
              }
            }
            if (config?.trim) {
              if (Array.isArray(outputValue)) {
                outputValue = outputValue.map(v => v.trim());
              } else if (outputValue != undefined) {
                outputValue = String(outputValue).trim();
              }
            }
            //Added by NimanthaH - 4/2/2023 - extrashipmentpercentage
            if (config?.extrashipmentpercentage) {
              if (Array.isArray(outputValue)) {
                outputValue = outputValue.map(v => parseFloat(v.trim()) * config?.extrashipmentpercentage);
              } else if (outputValue != undefined) {
                outputValue = parseInt(parseFloat(String(outputValue).trim()) * config?.extrashipmentpercentage);
              }
            }
            //End Adding
            if (config?.replace) {
              if (Array.isArray(outputValue)) {
                outputValue = outputValue.map(v =>
                  config.replace.reduce((prev, curr) => prev.replace(curr, ''), v)
                );
              } else {
                outputValue = config.replace.reduce(
                  (prev, curr) => prev.replace(curr, ''),
                  String(outputValue)
                );
              }
            }
            if (config?.sanitized) {
              outputValue = String(outputValue).replace(/'/g, "''");
            }
          }
          outputObj["Valid"] = validRow;
          outputObj[outputKey] = outputValue;
        });

        // Concatenate keys
        if (concatenateKeys) {
          concatenateKeys?.forEach(async concatenateKey => {
            const { newKey, keysToConcatenate, delimiter, config } = concatenateKey;
            const valuesToConcatenate = keysToConcatenate.map(k => outputObj[k]).filter(v => v !== undefined);
            const concatenatedValue = valuesToConcatenate.join(delimiter);
            let outputValue = concatenatedValue;
            if (config?.split && concatenatedValue != undefined) {
              outputValue = String(concatenatedValue).split(config.split);
            }
            if (config?.sub && concatenatedValue != undefined) {
              let textprocesser = String(concatenatedValue);
              let len = textprocesser.length;
              if (config?.sub?.option == 'init') {
                outputValue = textprocesser.substring(config?.sub?.numberofletters);
              } else if (config?.sub?.option == 'last') {
                outputValue = textprocesser.substring(len - config?.sub?.numberofletters);
              } else if (config?.sub?.option == 'mid') {
                outputValue = textprocesser.substring(config?.sub?.startnumber, config?.sub?.start + config?.sub?.numberofletters);
              } else if (config?.sub?.option == 'find') {
                let position = textprocesser.indexOf(config?.sub?.findchar);
                outputValue = position > 0 ? textprocesser.substring(position, position + config?.sub?.numberofletters) : '';
              }
            }
            if (config?.trim) {
              if (Array.isArray(outputValue)) {
                outputValue = outputValue.map(v => v.trim());
              } else if (outputValue != undefined) {
                outputValue = String(outputValue).trim();
              }
            }
            if (config?.replace) {
              if (Array.isArray(outputValue)) {
                outputValue = outputValue.map(v =>
                  config.replace.reduce((prev, curr) => prev.replace(curr, ''), v)
                );
              } else {
                outputValue = config.replace.reduce(
                  (prev, curr) => prev.replace(curr, ''),
                  String(outputValue)
                );
              }
            }
            if (config?.sanitized) {
              outputValue = String(outputValue).replace(/'/g, "''");
            }

            // console.log('outputValue: ', outputValue, config, concatenatedValue);
            outputObj[newKey] = outputValue;
          });
        }

        // Add grouping fields
        if (groupingSpec) {
          const { field, spans } = groupingSpec;
          const fieldValue = outputObj[field];
          spans?.forEach(([start, end], i) => {
            const key = `${field}_${start}_${end}`;
            outputObj[key] = fieldValue?.substring(start, end) || undefined;
          });
        }

        // Add array keys
        if (arrayKeySpecs) {
          arrayKeySpecs?.forEach(spec => {
            outputObj[spec.key] = spec.repeatValue;
          });
        }

        // Merge keys
        if (mergeKeys) {
          mergeKeys?.forEach(key => {
            const valuesToMerge = Object.keys(outputObj)
              .filter(k => k.startsWith(key))
              .map(k => outputObj[k])
              .filter(v => v !== undefined);
            outputObj[key] = valuesToMerge.join('_');
          });
        }

        return outputObj;
      });

    // Rename output fields to match model and filter out any extra keys
    //console.log("outputArray: ", outputArray);
    if (outputModel) {
      return outputArray?.filter(outputObj => outputObj["Valid"] === true).map(outputObj => {
        const renamedOutputObj = {};
        Object.entries(outputObj).forEach(([outputKey, outputValue]) => {
          const inputKey = Object.keys(outputModel).find(k => outputModel[k] === outputKey);
          if (inputKey) {
            renamedOutputObj[inputKey] = outputValue;
          }
        });
        return renamedOutputObj;
      });
    } else {
      return outputArray;
    }
  } catch (error) {
    throw new Error(`Failed to transform the data array. Error: ${error}`);
  }
}
//Join to get only matching data
function innerJoin(arr1, arr2, key1, key2) {
  // Create an array to store the joined results
  const results = [];
  //console.log('input parameters: ', arr1, arr2, key1, key2)
  try {
    if (arr1.length < 1 || arr2.length < 1 || key1 == '' || key2 == '') {
      throw new Error(`inner join failed due to input parameters are not in correct format.`);
      return;
    }
    // Create a map of key-value pairs from arr2
    const map2 = new Map(arr2.map(obj => [obj[key2], obj]));
    // Loop through each object in arr1
    for (const obj1 of arr1) {
      // Get the value of the key1 for this object
      const value1 = obj1[key1];
      // If the value of the key1 exists in the map2, add the joined object to the results
      if (map2.has(value1)) {
        // Combine the objects
        const obj2 = map2.get(value1);
        const joinedObj = { ...obj1, ...obj2 };
        results.push(joinedObj);
      }
    }
  } catch (error) {
    //throw error
    throw new Error(`failed to perform the inner join.` + error);
  }
  return results;
}
//Get fabric yy request details by request id to get parameters
async function getFabricYYRequestDetailsbyRequestId(fabyy_id) {
  // Define the SQL query to retrieve the data
  const sqlqry = `SELECT fm.*, fc.cus_name, ff.fac_name, fd.* 
    FROM fabricyy_master fm
    INNER JOIN sys_customer fc ON fm.cus_id = fc.cus_id 
    INNER JOIN sys_factory ff ON fm.fac_id = ff.fac_id
    LEFT JOIN fabricyy_details fd ON fm.fabyy_id = fd.fabyy_id 
    WHERE fm.fabyy_status != 'Delete' AND fm.fabyy_id = $1`;

  // Connect to the database pool
  const client = await pool.connect();
  try {
    // Execute the SQL query with the given ID parameter
    const result = await client.query(sqlqry, [fabyy_id]);
    // Return the retrieved rows
    return result.rows;
  } catch (error) {
    // Throw an error if the database query fails
    throw new Error(`Failed to retrieve fabric YY request details: ${error}`);
  } finally {
    // Release the client connection after the query is done
    client.release();
  }
}
//Get sizes in size templete data
async function getSizeNamesbyTemplateId(sizetempid) {
  // Connect to the database pool
  const client = await pool.connect();
  try {
    // Query to select all size names from the sys_sizeorder table for a given size template ID and order them by size order
    const sqlqry = `SELECT * FROM sys_sizeorder WHERE temp_id='${sizetempid}' ORDER BY size_order ASC;`;
    // Execute the query and retrieve the results
    const result = await client.query(sqlqry);
    // Return the array of size objects
    return result.rows;
  } catch (error) {
    // Throw an error message if there's a problem with the query execution
    throw new Error(`Failed to retrieve size names for template ID ${sizetempid}: ${error}`);
  } finally {
    // Release the client connection after the query is done
    client.release();
  }
}
//Database: delete exsisting data from olr table
async function deleteOLRDetailsFromOLRDatabyRequestId(fabyy_id) {
  // Use a parameterized query to prevent SQL injection attacks
  const sqlqry = {
    text: 'DELETE FROM olr_data WHERE fabyy_id = $1',
    values: [fabyy_id]
  };
  // Use async/await instead of Promises for improved readability and simplicity
  return (async () => {
    // Acquire a client from the connection pool
    const client = await pool.connect();
    try {
      // Start a transaction
      await client.query('BEGIN');
      // Execute the parameterized query to delete the data from the table
      const result = await client.query(sqlqry);
      // Commit the transaction
      await client.query('COMMIT');
      // Return the deleted rows
      return result.rows;
    } catch (error) {
      // Roll back the transaction if an error occurs
      await client.query('ROLLBACK');
      // Throw an error with a helpful message
      throw new Error(`Failed to delete data from the olr_data table: ${error}`);
    } finally {
      // Release the client back into the connection pool
      client.release();
    }
  })();
}
//insert all data into olr table from processed json
async function insertDataintoOLRTable(data, fabyy_id) {
  // console.log('insertDataintoOLRTable:data: ', data);
  // Check that the input parameters are valid
  if (!data || !Array.isArray(data) || !data.length || !fabyy_id) {
    throw new Error(`data insert failed, no matching data was found with filters (check for data in excel and for filters. ex: size template to olr size) or the insert function input parameters are not in correct format.`);
  }

  // Connect to the database
  const client = await pool.connect();

  try {
    // Start a transaction
    await client.query('BEGIN');

    // Define the SQL query to insert the data into the table
    const query = 'INSERT INTO olr_data(fabyy_id, custname, division, maststyledesc, custstyle, custstyledesc, mastcolordesc, custsizedesc, orderqty, season, vpono, techpackno, computecolordesc, key, flex) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15);';

    // Loop through each row of data and execute the query to insert it into the table
    for (const row of data) {
      await client.query(query, [
        fabyy_id,
        row.custname,
        row.divisioncode?.substring(0, 9),
        row.maststyledesc,
        row.custstyle ?? '',
        row.custstyledesc ?? '',
        row.mastcolordesc,
        row.mastsizedesc,
        row.orderqty,
        row.season,
        row.vpono,
        row.techpackno,
        row.computecolordesc,
        row.key,
        row.flex
      ]);
    }

    // Commit the transaction
    await client.query('COMMIT');
    return true;

  } catch (error) {
    // If an error occurs, roll back the transaction and throw an error with a message that includes the original error
    await client.query('ROLLBACK');
    throw new Error(`Failed to insert data into olr_data table. Error: ${error}`);
  } finally {
    // Release the database connection back to the pool
    client.release();
  }
}
//process olr items
async function processOLRItems(fabyyid, sizetempid) {

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Delete rows from olr_colorset table
    const deleteColorSetQuery = `DELETE FROM olr_colorset WHERE fabyy_id='${fabyyid}';`;
    await client.query(deleteColorSetQuery);

    // Insert rows into olr_colorset table
    const insertColorSetQuery = `INSERT INTO olr_colorset(fabyy_id, colorname, flex, vpono, division, computecolordesc, key)
      SELECT fabyy_id, mastcolordesc as colorname, flex, vpono, division, computecolordesc, key
      FROM olr_data WHERE fabyy_id='${fabyyid}'
      GROUP BY mastcolordesc, flex, vpono, division, fabyy_id, computecolordesc, key
      ORDER BY mastcolordesc, flex, vpono, division, computecolordesc, key;`;
    await client.query(insertColorSetQuery);

    // Delete rows from olr_sizeset table
    const deleteSizeSetQuery = `DELETE FROM olr_sizeset WHERE fabyy_id='${fabyyid}';`;
    await client.query(deleteSizeSetQuery);

    // Insert rows into olr_sizeset table
    const insertSizeSetQuery = `INSERT INTO olr_sizeset(fabyy_id, sizename)
      SELECT olr_data.fabyy_id, olr_data.custsizedesc as sizename
      FROM olr_data JOIN sys_sizeorder
      ON sys_sizeorder.size_name = olr_data.custsizedesc AND sys_sizeorder.temp_id = '${sizetempid}'
      WHERE fabyy_id='${fabyyid}'
      GROUP BY olr_data.custsizedesc, sys_sizeorder.size_order, olr_data.fabyy_id
      ORDER BY sys_sizeorder.size_order;`;
    await client.query(insertSizeSetQuery);

    // Update yy_desc, yy_item, and yy_season in fabricyy_master table
    const updateYYMasterQuery = `UPDATE fabricyy_master SET yy_desc=subtable.maststyledesc,yy_item=subtable.custstyledesc,yy_season=subtable.season
      FROM (SELECT maststyledesc, custstyledesc, season, fabyy_id
            FROM olr_data
            WHERE fabyy_id ='${fabyyid}' LIMIT 1) AS subtable
      WHERE fabricyy_master.fabyy_id =subtable.fabyy_id;`;
    await client.query(updateYYMasterQuery);

    await client.query('COMMIT');

    return { Type: "SUCCESS", Msg: "item list processed successfully." };
  } catch (error) {
    await client.query('ROLLBACK');
    //console.error(error);
    throw new Error(`Failed to process olr items. Error: ${error}`);
  } finally {
    client.release();
  }
};
//process olr lines
async function processOLRLines(fabyyid, sizetempid) {
  const client = await pool.connect();
  try {

    await client.query('BEGIN');

    const qry_del_olritems = `DELETE FROM olr_items WHERE fabyy_id='${fabyyid}';`;
    await client.query(qry_del_olritems);

    const qry_get_olrcolor = `SELECT colorname, flex, vpono, division, computecolordesc, key FROM olr_colorset WHERE fabyy_id='${fabyyid}' GROUP BY colorname, flex, vpono, division, computecolordesc, key ORDER BY colorname, flex, vpono, division, computecolordesc, key;`;
    const result_get_olrcolor = await client.query(qry_get_olrcolor);

    const qry_get_olrsizes = `SELECT sizename FROM olr_sizeset JOIN sys_sizeorder ON sys_sizeorder.size_name = olr_sizeset.sizename AND sys_sizeorder.temp_id = '${sizetempid}' WHERE fabyy_id='${fabyyid}' ORDER BY sys_sizeorder.size_order;`;
    const result_get_olrsizes = await client.query(qry_get_olrsizes);

    const insertPromises = result_get_olrcolor.rows.map(async (row_olrcolor, index) => {
      //const obj_olrcolor = row_olrcolor;
      const { colorname, flex, vpono, division, computecolordesc, key } = row_olrcolor

      const insertrow = await client.query(`INSERT INTO olr_items(fabyy_id,color, flex, vpono, division, garmentway, prod_plant, computecolordesc, index, key) VALUES ('${fabyyid}','${colorname}','${flex}','${vpono}','${division}','','','${computecolordesc}','${index}','${key}');`);
      let valinc = 0;
      if (insertrow) {
        await Promise.all(result_get_olrsizes.rows.map(async (row_olrsizes) => {
          const obj_olrsizes = row_olrsizes;
          valinc = valinc + 1;
          const qry_update = `UPDATE olr_items SET s${valinc}_name='${obj_olrsizes.sizename}', s${valinc}_qty=temptable.orderqty FROM (SELECT COALESCE(SUM(orderqty),0) as orderqty FROM olr_data WHERE fabyy_id='${fabyyid}' AND mastcolordesc='${colorname}' AND custsizedesc='${obj_olrsizes.sizename}' AND vpono='${vpono}' AND key='${key}') AS temptable WHERE fabyy_id='${fabyyid}' AND color='${colorname}' AND vpono='${vpono}' AND key='${key}';`
          await client.query(qry_update);
        }));
      } else { throw new Error(`failed to insert the data into olr_items table.`); }
    });

    await Promise.all(insertPromises);
    await client.query('COMMIT');
    return { Type: "SUCCESS", Msg: "item list successfully added." };
  } catch (error) {
    await client.query('ROLLBACK');
    console.log('Failed to process olr lines: ', error);
    throw new Error(`Failed to process olr lines. Error: ${error}`);
  } finally {
    client.release();
  }
};

