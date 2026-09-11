export default function StylePanel({
  branchTheme,
  setBranchTheme,
  nodeShape,
  setNodeShape,
  coreSymbol,
  setCoreSymbol,
  coreColor,
  setCoreColor,
  boardLayoutMode,
  setBoardLayoutMode
}) {
  return (
    <div className="style-panel">
      <div>
        <span>Board layout</span>
        <div className="segmented-control board-layout-control">
          {[
            ['custom', 'Custom'],
            ['tree', 'Tree'],
            ['grid', 'Grid'],
            ['no-lines', 'No lines']
          ].map(([mode, label]) => (
            <button
              key={mode}
              className={boardLayoutMode === mode ? 'is-active' : ''}
              onClick={() => setBoardLayoutMode(mode)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <span>Core symbol</span>
        <div className="segmented-control">
          {['leaf', 'flower', 'star'].map(symbol => (
            <button
              key={symbol}
              className={coreSymbol === symbol ? 'is-active' : ''}
              onClick={() => setCoreSymbol(symbol)}
            >
              {symbol}
            </button>
          ))}
        </div>
      </div>
      <div>
        <span>Core color</span>
        <div className="segmented-control">
          {['dark', 'sage', 'gold'].map(color => (
            <button
              key={color}
              className={coreColor === color ? 'is-active' : ''}
              onClick={() => setCoreColor(color)}
            >
              {color}
            </button>
          ))}
        </div>
      </div>
      <div>
        <span>Branch theme</span>
        <div className="segmented-control">
          {['tree', 'ink', 'warm'].map(theme => (
            <button
              key={theme}
              className={branchTheme === theme ? 'is-active' : ''}
              onClick={() => setBranchTheme(theme)}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>
      <div>
        <span>Card shape</span>
        <div className="segmented-control">
          {['soft', 'square', 'polaroid'].map(shape => (
            <button
              key={shape}
              className={nodeShape === shape ? 'is-active' : ''}
              onClick={() => setNodeShape(shape)}
            >
              {shape}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
