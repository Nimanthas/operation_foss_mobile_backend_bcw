module.exports = [
  //Harper Wilde
  {
    cus_id: 6,
    variation: 1,
    //Start: olr excel read parameters
    olrValidations: {
      sheetName: 'PO',
      sheetNumber: 0,
      blankRows: false,
      filterValueQtyRecords: 0,
      joinParameters: {
        join: true,
        data01Key: 'mastsizedesc', //Excel data
        data02Key: 'size_name', //Size template data
      },
      sections: true,
      headerKeys: ['HW Style #', 'Description', 'Vendor Size', 'Quantity', 'Type', 'Vendor Style #'],
      mandatoryKeys: ['Style::Vendor Style #', 'Style::HW Style #', 'Style::Description', 'Size::Vendor Size', 'Body Color::Description', 'Body Color::#', 'Size::Vendor Size', 'Price & Qtys::Quantity'],
      filterKey: 'Style::HW Style #',
      outputModel: {
        custname: 'custname',
        divisioncode: 'divisioncode',
        vpono: 'vpono',
        techpackno: 'techpackno',
        maststyledesc: 'maststyledesc',
        custstyle: 'custstyle',
        custstyledesc: 'custstyledesc',
        stylecolorname: 'stylecolorname',
        mastcolordesc: 'mastcolordesc',
        flex: 'flex',
        computecolordesc: 'computecolordesc',
        stylecolorextension: 'stylecolorextension',
        stylecolor: 'stylecolor',
        mastsizedesc: 'mastsizedesc',
        orderqty: 'orderqty',
        season: 'season',
        key: 'key'
      },
      fieldMappings: [ //config: { replace: ['-', ' '], trim: true , split: ',' , sub: {option: 'init, last, mid, find', numberofletters: 0, startnumber: 2, findchar: ? ''}}
        //{ inputKey: '', outputKey: 'custname', config: { trim: true } },
        //{ inputKey: 'Division', outputKey: 'divisioncode', config: { trim: true } },
        //{ inputKey: '', outputKey: 'vpono', config: { trim: true } },
        { inputKey: 'Style::Vendor Style #', outputKey: 'techpackno', config: { trim: true } },
        { inputKey: 'Style::Description', outputKey: 'maststyledesc', config: { trim: true } },
        { inputKey: 'PrePack Style#', outputKey: 'custstyle', config: { trim: true } },
        { inputKey: 'Style::HW Style #', outputKey: 'custstyledesc', config: { trim: true } },
        { inputKey: 'Body Color::Description', outputKey: 'stylecolorname', config: { trim: true } },
        { inputKey: 'Body Color::#', outputKey: 'stylecolorextension', config: { trim: true } },
        //{ inputKey: 'Style Color', outputKey: 'stylecolor', config: { trim: true } },
        { inputKey: 'Size::Vendor Size', outputKey: 'mastsizedesc', config: { trim: true } },
        { inputKey: 'Price & Qtys::Quantity', outputKey: 'orderqty', config: { trim: true, extrashipmentpercentage: 1, quantitycolumn: true } },
        //{ inputKey: 'Tech Pack Season', outputKey: 'season', config: { trim: true } }
      ],
      groupingSpec: { // field: 'name', spans: [[0, 1], [1, 3], [3, 7]]
        field: 'techpackno'
      },
      concatenateKeys: [
        {
          newKey: 'mastcolordesc',
          keysToConcatenate: ['stylecolorname', 'stylecolorextension', 'stylecolor'],
          delimiter: '-',
          config: {}
        },
        {
          newKey: 'computecolordesc',
          keysToConcatenate: ['stylecolorname'],
          delimiter: '',
          config: {}
        },
        {
          newKey: 'custstyledesc',
          keysToConcatenate: ['maststyledesc'],
          delimiter: '',
          config: {}
        },
        {
          newKey: 'stylecolor',
          keysToConcatenate: ['stylecolorname'],
          delimiter: '',
          config: {}
        },
        {
          newKey: 'key',
          keysToConcatenate: ['maststyledesc'],
          delimiter: '',
          config: {}
        }
      ],
      arrayKeySpecs: [ //{ key: 'ArrayKey2', repeatValue: 'Value2' }
        { key: 'custname', repeatValue: '-' },
        { key: 'vpono', repeatValue: '-' },
        { key: 'divisioncode', repeatValue: '-' },
        { key: 'season', repeatValue: '-' },
        { key: 'flex', repeatValue: '-' }
      ],
      mergeKeys: [//'Tags'

      ],
    },
    //End: olr excel read parameters

    //Start: plm api data read parameters
    plmValidations: {
      //Start: plm bom read parameters
      matTypes: [
        { matType: "Sewing", validateSubTypes: true, matSubTypes: ["Tape", "Snap tape", "Neck tape", "Mobilon tape", "Elastic", "Zipper", "Buttons", "Snap"] },
        { matType: "Fabric", validateSubTypes: false, matSubTypes: [] },
        { matType: "Embellishments and Graphics", validateSubTypes: false, matSubTypes: [] },
        { matType: "Washes and Finishes", validateSubTypes: false, matSubTypes: [] }
      ],
      plmSkipValue: ['centric%3A'],
      letterNumber: /^[0-9a-zA-Z]+$/,
      dyeRoots: [
        ['_HTR', ''], ['_NATURAL', ''], ['_PRINT', ''], ['_SOLID', ''], ['_NDD', ''], ['_YD', ''], ['_PD', ''],
        ['_SD', ''], ['_DSD', ''], ['_PSD', ''], ['_DD', ''], ['_ND', ''], ['_NPSD', ''], ['_NDD', ''],
        ['_NPD', ''], ['_PFD', ''], [' - TOP', ''], ['-TOP', ''], [' - BOTTOM', ''], ['-BOTTOM', ''],
        [' - BTM', ''], ['-BTM', ''], [' - KIM', ''], ['-KIM', '']
      ],
      //End: plm bom read parameters

      filterKey: '',
      joinParameters: {
        join: false
      },
      mandatoryKeys: ['plm_color'],
      outputModel: null, //{} 
      fieldMappings: [ //config: { replace: ['-', ' '], trim: true , split: ',' , sub: {option: 'init, last, mid, find', numberofletters: 0, startnumber: 2, findchar: ? ''}}
        //BOM Items
        { inputKey: 'fabyy_id', outputKey: 'fabyy_id', config: { trim: true } },
        { inputKey: 'plm_item_id', outputKey: 'plm_item_id', config: { trim: true } },
        { inputKey: 'plm_actual', outputKey: 'plm_actual', config: { trim: true } },
        { inputKey: 'plm_item_name', outputKey: 'plm_item_name', config: { trim: true } },
        { inputKey: 'plm_item_desc', outputKey: 'plm_item_desc', config: { trim: true } },
        { inputKey: 'plm_colorway_type', outputKey: 'plm_colorway_type', config: { trim: true } },
        //{ inputKey: 'plm_supplier', outputKey: 'plm_supplier', config: { trim: true } },
        { inputKey: 'plm_fab_type', outputKey: 'plm_fab_type', config: { trim: true } },
        { inputKey: 'plm_cw', outputKey: 'plm_cw', config: { trim: true } },
        { inputKey: 'plm_placement', outputKey: 'plm_placement', config: { trim: true } },
        { inputKey: 'plm_color', outputKey: 'plm_color', config: { trim: true } },
        { inputKey: 'gmt_color_order', outputKey: 'gmt_color_order', config: { trim: true } },
        { inputKey: 'plm_consumption', outputKey: 'plm_consumption', config: { trim: true } },
        { inputKey: 'plm_uom', outputKey: 'plm_uom', config: { trim: true } },
        //Colors
        { inputKey: 'plm_cw_id', outputKey: 'plm_cw_id', config: { trim: true } },
        { inputKey: 'cw_name', outputKey: 'cw_name', config: { trim: true } },
        { inputKey: 'cw_desc', outputKey: 'cw_desc', config: { trim: true } },
        { inputKey: 'colorway', outputKey: 'colorway', config: { trim: true } },
        { inputKey: 'garmentway', outputKey: 'garmentway', config: { trim: true } },
        { inputKey: 'cw_order', outputKey: 'cw_order', config: { trim: true } },
      ],
      groupingSpec: { // field: 'name', spans: [[0, 1], [1, 3], [3, 7]]
      },
      concatenateKeys: [
        {
          newKey: 'computecolordesc_item',
          keysToConcatenate: ['plm_color'],
          delimiter: '',
          config: { trim: true } //, sub: { option: 'last', numberofletters: 3 }
        },
        {
          newKey: 'computecolordesc_color',
          keysToConcatenate: ['plm_color'],
          delimiter: '',
          config: { trim: true } //, sub: { option: 'last', numberofletters: 3 }
        },
        {
          newKey: 'plm_supplier',
          keysToConcatenate: ['supplier_name', 'supplier_number'],
          delimiter: ' - ',
          config: { trim: true }
        },
        {
          newKey: 'plm_item_desc',
          keysToConcatenate: ['plm_item_desc', 'bx_supplier_quality_reference'],
          delimiter: ' - ',
          config: { trim: true }
        }
      ],
      arrayKeySpecs: [ //{ key: 'ArrayKey2', repeatValue: 'Value2' }
      ],
      mergeKeys: [//'Tags'
      ],
    },
    group_plm_items_vpo: false
    //End: plm api data read parameters
  }
];