import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

const VisualOverrides = () => {
  useEffect(() => {
    const flagshipParagraph = Array.from(document.querySelectorAll('p')).find(
      (p) =>
        p.textContent.trim() === 'The Excalibur Flagship · Foundation & Venture Semesters' &&
        p.parentElement?.style.background === 'rgb(228, 213, 193)'
    );

    const programParagraph = Array.from(document.querySelectorAll('p')).find(
      (p) =>
        p.textContent.trim() === 'Program Overview' &&
        p.parentElement?.style.background === 'rgb(15, 15, 15)'
    );

    if (flagshipParagraph) {
      flagshipParagraph.textContent = 'Foundation & Venture Semesters';
    }

    if (programParagraph) {
      programParagraph.textContent = '';
    }
  }, []);

  return <App />;
};

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <VisualOverrides />
  </StrictMode>
);
