import { useMemo, useState } from 'react';

type PostCard = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  href: string;
  image?: string;
};

export default function TagFilter({ posts, allTags }: { posts: PostCard[]; allTags: string[] }) {
  const [active, setActive] = useState<string | null>(null);

  const visible = useMemo(
    () => (active ? posts.filter((p) => p.tags.includes(active)) : posts),
    [active, posts],
  );

  return (
    <div>
      <div className="chips">
        <button className={`chip${!active ? ' is-active' : ''}`} type="button" onClick={() => setActive(null)}>
          all
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            className={`chip${tag === active ? ' is-active' : ''}`}
            type="button"
            onClick={() => setActive(tag === active ? null : tag)}
          >
            #{tag}
          </button>
        ))}
      </div>
      <div className="grid">
        {visible.map((post) => (
          <a className="card" href={post.href} key={post.slug}>
            <div className="pic">
              {post.image ? <img src={post.image} alt="" /> : <div className="ph" />}
            </div>
            <div className="pad">
              <p className="tag">{post.date}</p>
              <h3>{post.title}</h3>
              {post.excerpt ? <p className="meta">{post.excerpt}</p> : null}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
