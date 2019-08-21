import { ipcMain } from 'electron'
import SVGO from 'svgo'
import fs from 'fs'

const svgo = new SVGO({
  plugins: [
    {
      cleanupAttrs: true,
    },
    {
      removeDoctype: true,
    },
    {
      removeXMLProcInst: true,
    },
    {
      removeComments: true,
    },
    {
      removeMetadata: true,
    },
    {
      removeTitle: true,
    },
    {
      removeDesc: true,
    },
    {
      removeUselessDefs: true,
    },
    {
      removeEditorsNSData: true,
    },
    {
      removeEmptyAttrs: true,
    },
    {
      removeHiddenElems: true,
    },
    {
      removeEmptyText: true,
    },
    {
      removeEmptyContainers: true,
    },
    {
      removeViewBox: false,
    },
    {
      cleanupEnableBackground: true,
    },
    { inlineStyles: { "onlyMatchedOnce": false } },
    {
      convertStyleToAttrs: true,
    },
    {
      convertColors: true,
    },
    {
      convertPathData: true,
    },
    {
      convertTransform: true,
    },
    {
      removeUnknownsAndDefaults: true,
    },
    {
      removeNonInheritableGroupAttrs: true,
    },
    {
      removeUselessStrokeAndFill: true,
    },
    {
      removeUnusedNS: true,
    },
    {
      cleanupIDs: true,
    },
    {
      cleanupNumericValues: true,
    },
    {
      moveElemsAttrsToGroup: true,
    },
    {
      moveGroupAttrsToElems: true,
    },
    {
      collapseGroups: true,
    },
    {
      removeRasterImages: false,
    },
    {
      mergePaths: false,
    },
    {
      convertShapeToPath: true,
    },
    {
      sortAttrs: true,
    },
    {
      removeDimensions: true,
    },
    {
      removeAttrs: { attrs: '(fill)' },
    },
    {
      viewBox: {
        type: 'full',
        fn: function(data) {
          const svg = data.content[0]
          if (svg.isElem('svg') && svg.attr('width') && svg.attr('height')) {
            svg.addAttr({
              name: 'viewBox',
              value: '0 0 ' + svg.attr('width').value + ' ' + svg.attr('height').value,
              prefix: '',
              local: 'class',
            })
            svg.removeAttr('width')
            svg.removeAttr('height')
          }
          return data
        },
      },
    },
  ] as any,
})

ipcMain.on('getSVG', async (event, path: string) => {
  try {
    const raw = fs.readFileSync(path, 'utf8'),
      res = await svgo.optimize(raw, { path })
    event.reply('svgRes', res)
  } catch (e) {
    console.log(e)
    event.reply('svgRes', null)
  }
})
