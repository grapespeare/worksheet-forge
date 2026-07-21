import type { TableElement as TableElementType } from '@/types/worksheet';

interface Props {
  element: TableElementType;
  isSelected: boolean;
}

export default function TableElement({ element, isSelected }: Props) {
  const rows = element.rows || 4;
  const cols = element.cols || 3;
  const data = element.cellData || Array(rows).fill(null).map(() => Array(cols).fill(''));
  return (
    <div className="w-full h-full" style={{ cursor: isSelected ? 'text' : 'grab' }}>
      <table className="w-full h-full border-collapse">
        <tbody>
          {data.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c} className="border border-border-medium text-[13px] text-ink relative"
                  style={{ padding: '8px', width: `${100 / cols}%`, height: `${100 / rows}%`, backgroundColor: r === 0 ? '#F0EBE0' : 'transparent', fontWeight: r === 0 ? 600 : 400 }}>
                  <div contentEditable suppressContentEditableWarning className="w-full h-full outline-none">{cell}</div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
