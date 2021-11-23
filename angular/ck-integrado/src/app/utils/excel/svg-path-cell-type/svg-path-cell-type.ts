import { Spread } from '@grapecity/spread-sheets';
import { isNil } from '@aw-utils/utils';

export interface SvgPathCellTypeConfig {
  truePath: string | Path2D;
  falsePath: string | Path2D;
  height: number;
  width: number;
}

export class SvgPathCellType extends Spread.Sheets.CellTypes.Base {
  constructor({ falsePath, truePath, height, width }: SvgPathCellTypeConfig) {
    super();
    this._truePath = new Path2D(truePath);
    this._falsePath = new Path2D(falsePath);
    this._height = height;
    this._width = width;
  }

  private readonly _truePath: Path2D;
  private readonly _falsePath: Path2D;
  private readonly _height: number;
  private readonly _width: number;

  paint(ctx: CanvasRenderingContext2D, value: any, x: number, y: number, w: number, h: number): void {
    if (!ctx) {
      return;
    }
    ctx.save();
    const path = value ? this._truePath : this._falsePath;
    const halfHCell = h / 2;
    const halfHSvg = this._height / 2;
    const halfWCell = w / 2;
    const halfWSvg = this._width / 2;
    // Esses calculos são pra colocar o svg no meio da celula
    ctx.translate(x + (halfWCell - halfWSvg), y + (halfHCell - halfHSvg));
    ctx.fill(path);
    ctx.restore();
  }

  getHitInfo(
    x: number,
    y: number,
    cellStyle: Spread.Sheets.Style,
    cellRect: Spread.Sheets.Rect,
    context?: any
  ): Spread.Sheets.IHitTestCellTypeHitInfo {
    return {
      row: context?.row,
      col: context?.col,
      cellRect,
      x,
      y,
      isReservedLocation: false,
      sheetArea: context?.sheetArea,
      sheet: context?.sheet,
    };
  }

  processMouseUp(hitInfo: Spread.Sheets.IHitTestCellTypeHitInfo): boolean {
    const { row, col, sheet } = hitInfo;
    if (!isNil(row) && !isNil(col) && !isNil(sheet)) {
      const value = sheet.getValue(row, col);
      const workbook = sheet.getParent();
      sheet.setValue(row, col, !value);
      return true;
    }
    return false;
  }

  isEditingValueChanged(oldValue: boolean, newValue: boolean): boolean {
    return oldValue !== newValue;
  }

  static eyeOpenPath = new Path2D(
    `M22.639 8.086c-.986-1.993-2.389-3.645-4.106-4.893l-.038-.026c-1.516-1.137-3.423-1.829-5.49-1.853l-.006 0c-2.073.024-3.98.716-5.52 1.87l.024-.017c-1.754 1.274-3.158 2.926-4.109 4.843l-.034.077c-.139.266-.222.58-.225.913l0 .001c.005.338 .088.657 .231.939l-.006-.012c.989 1.987 2.392 3.634 4.106 4.881l.038.026c1.516 1.137 3.423 1.829 5.49 1.853l.006 0c2.073-.024 3.98-.716 5.52-1.87l-.024.017c1.757-1.267 3.161-2.916 4.109-4.831l.034-.076c.138-.27.22-.588.225-.925l0-.002c-.004-.334-.087-.648-.231-.925l.005.011zM10.634 4.431c.549-.718 1.402-1.18 2.364-1.189l.002 0c.001 0 .002 0 .003 0 .152 0 .287.073 .372.187l.001.001c.094.118 .15.269 .15.434 0 .006 0 .012 0 .018l0-.001c0 .005 0 .011 0 .017 0 .165-.057.316-.152.435l.001-.001c-.085.114-.22.188-.372.188-.001 0-.002 0-.003 0h0c-.658.007-1.24.323-1.611.809l-.004.005c-.421.51-.677 1.171-.677 1.891 0 .026 0 .052.001 .078l0-.004c0 .005 0 .011 0 .017 0 .165-.057.316-.152.435l.001-.001c-.088.112-.223.184-.376.184s-.288-.071-.375-.183l-.001-.001c-.094-.118-.15-.269-.15-.434 0-.006 0-.012 0-.018l0 .001c-.001-.031-.001-.067-.001-.103 0-1.051.369-2.015.984-2.771l-.006.008zM17.782 13.381c-1.311 1.008-2.976 1.615-4.782 1.615s-3.471-.607-4.801-1.629l.019.014c-1.527-1.164-2.762-2.628-3.634-4.31l-.033-.071c.977-1.943 2.403-3.534 4.148-4.679l.045-.028c-.427.862-.676 1.877-.676 2.95 0 .019 0 .038 0 .057l0-.003c-.001.042-.002.091-.002.141 0 1.552.549 2.977 1.463 4.089l-.009-.011c.798 1.068 2.059 1.753 3.48 1.753s2.682-.684 3.472-1.741l.008-.011c.905-1.101 1.454-2.526 1.454-4.078 0-.049-.001-.099-.002-.148l0 .007c0-.016 0-.035 0-.055 0-1.073-.25-2.088-.694-2.99l.018.04c1.79 1.173 3.217 2.764 4.162 4.639l.031.068c-.905 1.754-2.141 3.218-3.637 4.359l-.031.023z`
  );
  static eyeClosedPath = new Path2D(
    'M8.783 10.432c-.565-.798-.903-1.79-.903-2.862 0-.012 0-.024 0-.036l0 .002c.002-.341.036-.673.097-.995l-.005.034 3.199 5.737c-.99-.38-1.805-1.031-2.377-1.863l-.011-.017zM8.314 2.529c-.008-.024-.012-.053-.012-.082 0-.007 0-.015.001-.022l0 .001q0-.194.183-.309c.023-.015.097-.059.223-.132s.246-.143.36-.211.24-.139.377-.211.255-.131.354-.177c.06-.032.129-.056.202-.066l.003 0c.002 0 .005 0 .008 0 .133 0 .25.073 .311.181l.001.002 .617 1.108c.618-.122 1.329-.193 2.056-.194h.001q3.074 0 5.669 1.554t4.342 4.238c.143.223 .229.496 .229.789s-.085.565-.232.795l.004-.006c-.689 1.066-1.476 1.987-2.37 2.791l-.012.011c-.864.782-1.857 1.443-2.938 1.947l-.073.03q.503.857 .503.994c0 .002 0 .005 0 .008 0 .133-.073.25-.181.311l-.002.001q-1.394.801-1.531.801c-.002 0-.004 0-.006 0-.134 0-.251-.073-.313-.182l-.001-.002-.56-1.017q-1.212-2.162-3.612-6.48t-3.599-6.471zM16.897 13.284q2.971-1.337 4.88-4.286-1.737-2.697-4.354-4.036c.438.736 .697 1.623.697 2.57 0 .847-.207 1.646-.573 2.349l.013-.028c-.376.734-.902 1.344-1.54 1.807l-.015.01zM12.612 4.998c.096.099 .231.16 .379.16 .003 0 .006 0 .01 0h0c1.312.001 2.376 1.065 2.377 2.377v0c0 .303.246 .549.549 .549s.549-.246.549-.549v0q0-1.429-1.023-2.451t-2.451-1.023c-.303 0-.549.246-.549.55 0 .151.061 .288.16 .387l0 0zM2.989 8.209c.49-.795 1.035-1.485 1.652-2.103l0 0c.623-.639 1.305-1.214 2.04-1.719l.046-.03.721 1.281q-1.909 1.313-3.223 3.359 1.383 2.148 3.446 3.508t4.486 1.566l.845 1.509c-.014 0-.03 0-.047 0-1.727 0-3.359-.401-4.811-1.114l.064.029q-2.259-1.087-3.972-3.051-.801-.926-1.246-1.657c-.143-.223-.229-.496-.229-.789s.085-.565.232-.795l-.004.006z'
  );

  static eyeConfig: SvgPathCellTypeConfig = {
    truePath: SvgPathCellType.eyeOpenPath,
    falsePath: SvgPathCellType.eyeClosedPath,
    width: 26,
    height: 18,
  };
}
