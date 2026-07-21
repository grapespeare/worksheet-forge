import type { EquationElement as EquationElementType } from '@/types/worksheet';

interface Props {
  element: EquationElementType;
  isSelected: boolean;
}

function renderEquation(latex: string): string {
  let html = latex;
  html = html.replace(/frac\(([^,]+),([^)]+)\)/g, '<span class="inline-flex flex-col items-center mx-1 align-middle"><span class="border-b border-ink pb-0.5 px-1">$1</span><span class="px-1">$2</span></span>');
  html = html.replace(/sqrt\(([^)]+)\)/g, '<span class="inline-flex items-start"><span class="text-[14px] mr-0.5">&radic;</span><span class="border-t border-ink pt-0.5 px-1">$1</span></span>');
  html = html.replace(/([a-zA-Z0-9])\^(\d+)/g, '$1<sup class="text-[10px] align-super">$2</sup>');
  html = html.replace(/([a-zA-Z0-9])_(\d+)/g, '$1<sub class="text-[10px] align-sub">$2</sub>');
  html = html.replace(/\bpi\b/g, '&pi;');
  html = html.replace(/\btheta\b/g, '&theta;');
  html = html.replace(/\balpha\b/g, '&alpha;');
  html = html.replace(/\bbeta\b/g, '&beta;');
  html = html.replace(/\bgamma\b/g, '&gamma;');
  html = html.replace(/\bdelta\b/g, '&delta;');
  html = html.replace(/\bsigma\b/g, '&sigma;');
  html = html.replace(/\bomega\b/g, '&omega;');
  return html;
}

export default function EquationElement({ element }: Props) {
  const fontSize = element.fontSize || 18;
  const rendered = renderEquation(element.latex || '');

  return (
    <div className="w-full h-full flex items-center justify-center" style={{ cursor: 'grab' }}>
      <div className="text-ink font-serif" style={{ fontSize: `${fontSize}px` }} dangerouslySetInnerHTML={{ __html: rendered }} />
    </div>
  );
}
