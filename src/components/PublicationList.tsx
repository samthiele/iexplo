import { useMemo, useState } from 'react';

type PaperCard = {
  slug: string;
  title: string;
  date: string;
  href: string;
  authors: string;
  journal: string;
  year: string | number | null;
  doi: string;
  excerpt: string;
};

export default function PublicationList({ papers }: { papers: PaperCard[] }) {
  const [q, setQ] = useState('');
  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return papers;
    return papers.filter((p) =>
      [p.title, p.authors, p.journal, p.doi, p.excerpt].join(' ').toLowerCase().includes(needle),
    );
  }, [q, papers]);

  return (
    <div>
      <label className="meta" htmlFor="pub-search">Search publications</label>
      <input
        id="pub-search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Title, author, journal, DOI…"
        className="search-input"
      />
      {visible.map((paper) => (
        <article className="cite" key={paper.slug}>
          <div className="kicker">{paper.year || paper.date}</div>
          <h3 style={{ margin: '0.2rem 0' }}>
            <a href={paper.href}>{paper.title}</a>
          </h3>
          {paper.authors ? <div className="meta">{paper.authors}</div> : null}
          {paper.journal ? <div className="meta"><em>{paper.journal}</em></div> : null}
          {paper.doi ? (
            <div className="meta">
              <a href={`https://doi.org/${paper.doi}`}>{paper.doi}</a>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
