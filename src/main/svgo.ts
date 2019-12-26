import { ipcMain } from 'electron'
import SVGO from 'svgo'
import fs from 'fs'
import pathUtils from 'path'

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
    { inlineStyles: { onlyMatchedOnce: false } },
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

ipcMain.on('getSVG', async (event, dpath: string) => {
  const dir = fs.readdirSync(dpath),
    svgs = dir.filter(path => pathUtils.extname(path) === '.svg'),
    reses = await Promise.all(
      svgs
        .map(async path => {
          let res = null
          try {
            const absPath = pathUtils.join(dpath, path),
              raw = fs.readFileSync(absPath, 'utf8')
            res = await svgo.optimize(raw, { path: absPath })
          } catch (e) {}
          return res
        })
        .filter(a => a)
    )
  event.reply('svgRes', reses)
})

ipcMain.on('encodeFont', async (event, path: string) => {
  const raw = fs.readFileSync(path).toString('base64')
  event.reply('fontRes', raw)
})
