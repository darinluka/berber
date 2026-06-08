import { getDashboardReviews } from "@/app/actions/reviews";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const result = await getDashboardReviews();
  const reviews = result.success ? result.reviews : [];

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
    : 0;

  // Count distribution
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    if (distribution[r.rating] !== undefined) {
      distribution[r.rating]++;
    }
  });

  return (
    <div style={{ padding: '1.5rem', color: 'var(--foreground)' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .reviews-summary-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }
        .summary-card-dark {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .distribution-card-dark {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 2rem;
        }
        .dist-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }
        .dist-label {
          width: 50px;
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 600;
        }
        .dist-bar-bg {
          flex: 1;
          height: 8px;
          background: var(--border);
          border-radius: 4px;
          overflow: hidden;
        }
        .dist-bar-fill {
          height: 100%;
          background: var(--primary);
          border-radius: 4px;
        }
        .dist-count {
          width: 30px;
          font-size: 0.85rem;
          text-align: right;
          font-weight: 700;
          color: var(--foreground);
        }
        .review-list-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          margin-bottom: 1.25rem;
          transition: border-color 0.2s;
        }
        .review-list-card:hover {
          border-color: rgba(212, 175, 55, 0.3);
        }
        @media (max-width: 768px) {
          .reviews-summary-grid {
            grid-template-columns: 1fr;
          }
        }
      `}} />

      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)', fontWeight: 500 }}>Vlerësimet e Sallonit</h1>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>Shikoni komentet dhe vlerësimet e bëra nga klientët tuaj.</p>

      {totalReviews > 0 ? (
        <>
          <div className="reviews-summary-grid">
            {/* Avg Rating Card */}
            <div className="summary-card-dark">
              <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Nota Mesatare
              </span>
              <span style={{ fontSize: '4.5rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-serif)', margin: '0.5rem 0' }}>
                {avgRating}
              </span>
              <div style={{ color: 'var(--primary)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                {"★".repeat(Math.round(avgRating)) + "☆".repeat(5 - Math.round(avgRating))}
              </div>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Bazuar në {totalReviews} {totalReviews === 1 ? 'vlerësim' : 'vlerësime'}
              </span>
            </div>

            {/* Distribution Card */}
            <div className="distribution-card-dark">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 600 }}>Shpërndarja e Vlerësimeve</h3>
              {[5, 4, 3, 2, 1].map(stars => {
                const count = distribution[stars] || 0;
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={stars} className="dist-row">
                    <div className="dist-label">{stars} yje</div>
                    <div className="dist-bar-bg">
                      <div className="dist-bar-fill" style={{ width: `${percentage}%` }}></div>
                    </div>
                    <div className="dist-count">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem', fontFamily: 'var(--font-serif)', fontWeight: 500 }}>
            Të gjitha vlerësimet ({totalReviews})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviews.map((rev) => (
              <div key={rev.id} className="review-list-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#fff' }}>{rev.clientName}</h4>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {new Date(rev.createdAt).toLocaleString('sq-AL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1rem' }}>
                      {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                    </div>
                    {rev.clientId && (
                      <span style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.15rem 0.5rem', borderRadius: '4px', marginTop: '4px', fontWeight: 700 }}>
                        KLIENT I VERIFIKUAR
                      </span>
                    )}
                  </div>
                </div>
                {rev.comment ? (
                  <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>
                    "{rev.comment}"
                  </p>
                ) : (
                  <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0, opacity: 0.6 }}>
                    Ska koment të shkruar.
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '6rem 2rem',
          background: 'var(--surface)',
          border: '2px dashed var(--border)',
          borderRadius: 'var(--radius-lg)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>⭐</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', fontWeight: 600 }}>Nuk ka ende asnjë vlerësim</h2>
          <p className="text-muted" style={{ maxWidth: '480px', margin: '0 auto', fontSize: '1rem', lineHeight: '1.6' }}>
            Klientët tuaj mund të lënë vlerësime drejtpërdrejt në faqen tuaj publike të sallonit. Sapo të kryhen vlerësimet e para, ato do të shfaqen këtu.
          </p>
        </div>
      )}
    </div>
  );
}
