import { useState } from 'react';
import { crewFor, PHOTOS, TIMELINES, CASTING_TIMELINE, STAGE_LABELS, SPOTS } from './pulseData.js';
import { stageOf, stagesFor, AM_FILTER_LABEL, ActionModal } from './amine.jsx';
import LiveStatus from './LiveStatus.jsx';

/* F · Table fixes — the creators-table study's seven picks, worn together
   (creators-table-study/, Jul 28). Laws: the rail's ramp is the page's one
   progress language · amber = the ball is in your court · gold = joy ·
   celebration and chores never wear the same clothes. The A table
   (AmineTable) stays untouched for comparison. */

const B = import.meta.env.BASE_URL;
const ICO = {
  group: `${B}labs/group.svg`,
  check: `${B}labs/check-circle.svg`,
  chevron: `${B}labs/chevron.svg`,
};

/* stage chip fills = the rail's exact ramp (AM2_RAIL fills, amine.jsx) */
const CHIP_FILLS = [
  { bg: '#b9dfcb', ink: '#06301f' },
  { bg: '#8fceae', ink: '#06301f' },
  { bg: '#5fb98c', ink: '#06301f' },
  { bg: '#30aa70', ink: '#ffffff' },
  { bg: '#17864f', ink: '#ffffff' },
  { bg: '#1a6f4c', ink: '#ffffff' },
  { bg: '#124a33', ink: '#ffffff' },
];

const needsAction = (c) => (c.mystery && c.found) || (!c.mystery && !!c.action);

/* "thank-you sent 💌" moved into the stamp — strip it from the status line */
const cleanStatus = (status) => ({
  ...status,
  phrases: status.phrases.map((p) => p.replace(/\s*·\s*thank-you sent 💌\s*$/, '')),
});

export default function FixedTable({ scene, rows, filter, onFilter, openCrew, toggleCrew }) {
  const crewAll = crewFor(scene.day, scene.mode);
  const cohort = crewAll.length;
  const filtered = filter != null;
  const stages = stagesFor(scene.mode);
  const [modal, setModal] = useState(null);
  const [sheetDone, setSheetDone] = useState(false);

  const inviting = crewAll.some((c) => !c.mystery && c.stage === 0 && !c.found);
  const shipDay = crewAll.some((c) => c.ship);
  const wrapped = scene.day === 30;
  /* live & unthanked = the joy rows (thanks never wears the chore costume) */
  const liveRows = wrapped ? [] : crewAll.filter((c) => !c.mystery && stageOf(c, scene.day) === 5);
  /* thanks is a gift, not a task — it never counts into the amber light */
  const needs = crewAll.filter((c) => needsAction(c) && !(stageOf(c, scene.day) === 5 && !c.mystery)).length;

  /* §1 · the subtitle is the table's status light */
  const sub = filtered ? (
    <span className="am-card-sub">{rows.length} of {cohort} · {AM_FILTER_LABEL(filter, scene.mode)}</span>
  ) : needs > 0 ? (
    <span className="am-card-sub tf-sub--amber"><i className="tf-dot" style={{ background: '#f0a32e' }} />{needs} waiting on you</span>
  ) : (
    <span className="am-card-sub"><i className="tf-dot" style={{ background: '#2baf87' }} />
      {wrapped ? 'Nothing left to do — campaign wrapped'
        : liveRows.length ? `Nothing needs you — ${liveRows.length} live this week`
        : inviting ? 'Nothing needs you — invites are out'
        : 'Nothing needs you — everyone’s moving'}
    </span>
  );

  const downloadOrders = () => {
    const named = crewAll.filter((c) => !c.mystery);
    const csv = [
      'Creator,Handle,Product,Shipping status',
      ...named.map((c) => [c.name, c.handle, c.product || '—', c.ship ? 'needs shipping' : 'shipped'].join(',')),
    ].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: 'benable-orders.csv' });
    a.click();
    URL.revokeObjectURL(url);
    setSheetDone(true);
  };

  const liveNames = liveRows.map((c) => c.name);
  const liveLabel = liveNames.length > 1
    ? `${liveNames.slice(0, -1).join(', ')} and ${liveNames[liveNames.length - 1]}`
    : liveNames[0];

  return (
    <section className="am-card am-table tf-table" aria-label="Creators">
      <div className="am-card-head tf-head">
        <div className="am-head-l">
          <span className="am-symtile"><img src={ICO.group} alt="" /></span>
          <div>
            <p className="am-card-title">Creators</p>
            {sub}
          </div>
        </div>
        <div className="am-head-r">
          {/* §2 · education lives behind a tiny door, never as a paragraph */}
          {inviting && (
            <span className="tf-info" tabIndex={0}>
              <b>{SPOTS} spots</b>&nbsp;· how matching works <span className="tf-info-i">ⓘ</span>
              <span className="tf-pop" role="tooltip">
                <b>First come, first matched.</b> Your campaign has {SPOTS} spots. The first {SPOTS} creators to accept are in — anyone extra is saved for your next campaign, already warm.
              </span>
            </span>
          )}
          {filtered && (
            <button type="button" className="am-showall" onClick={() => onFilter(null)}>
              Show all <span aria-hidden>✕</span>
            </button>
          )}
        </div>
      </div>

      {/* §6 · the shipping flow reads as a flow — download is step one */}
      {shipDay && (
        <div className="tf-steps">
          <div className="tf-steps-l">
            {sheetDone ? (
              <>
                <span className="tf-step tf-step--done"><i className="tf-sn">✓</i>Order sheet downloaded</span>
                <span className="tf-arrow" aria-hidden>→</span>
                <span className="tf-step tf-step--now"><i className="tf-sn">2</i>Ship, then add tracking per creator</span>
              </>
            ) : (
              <>
                <span className="tf-step tf-step--now"><i className="tf-sn">1</i>Download the order sheet</span>
                <span className="tf-arrow" aria-hidden>→</span>
                <span className="tf-step"><i className="tf-sn">2</i>Ship the packages</span>
                <span className="tf-arrow" aria-hidden>→</span>
                <span className="tf-step"><i className="tf-sn">3</i>Add tracking below</span>
              </>
            )}
          </div>
          {sheetDone ? (
            <button type="button" className="am-showall" onClick={downloadOrders}>⬇ Get the sheet again</button>
          ) : (
            <button type="button" className="tf-dl" onClick={downloadOrders}>
              <svg aria-hidden width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M8 2.5v7m0 0 3-3m-3 3-3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 13.5h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              Download order sheet
            </button>
          )}
        </div>
      )}

      {/* §5 · the moment band — celebration (and its education) above the rows */}
      {liveRows.length > 0 && (
        <div className="tf-band">
          <span className="tf-faces">
            {liveRows.map((c) => <img key={c.name} src={PHOTOS[c.name]} alt="" />)}
          </span>
          <span className="tf-band-txt">
            <b>{liveLabel} went live 🎉</b> — this is when a thank-you lands the deepest. Creators who feel the love post again.
          </span>
          <button type="button" className="tf-postcard tf-band-cta">💌 Send yours</button>
        </div>
      )}

      {/* §7 · wrap day — the table becomes a trophy shelf */}
      {wrapped && (
        <div className="tf-wrapband">
          <span className="tf-wrap-emoji" aria-hidden>🎉</span>
          <div>
            <p className="tf-wrap-big">All {cohort} live — every thank-you sent</p>
            <p className="tf-wrap-sub">Wrapped 37 days ahead of average · your wrap-up is ready</p>
          </div>
        </div>
      )}

      <div className="am-cols" aria-hidden>
        <span>CREATOR</span><span>LATEST UPDATE</span><span>STAGE</span><span />
      </div>

      {rows.length === 0 ? (
        <div className="am-empty">
          <p className="am-empty-title">Nobody is in {AM_FILTER_LABEL(filter, scene.mode) ?? 'this filter'} right now</p>
          <p className="am-empty-sub">The stage is empty at the moment. Clear the filter to see the rest of the cohort.</p>
          <button type="button" className="am-showall am-empty-btn" onClick={() => onFilter(null)}>
            Show all creators
          </button>
        </div>
      ) : (
        rows.map((c, i) => {
          const rowKey = `${scene.day}-${c.name}-${i}`;
          const open = openCrew.has(rowKey);
          const timeline = c.mystery ? CASTING_TIMELINE : TIMELINES[c.name] || [];
          const reached = c.mystery ? -1 : stageOf(c, scene.day);
          const foundRow = c.mystery && c.found;
          const live = !c.mystery && !wrapped && reached === 5;
          /* §4 · amber = the ball is in your court (thanks stays out of it) */
          const amber = (foundRow || (!c.mystery && !!c.action)) && !live;
          const actModal = c.ship
            ? { kind: 'ship', name: c.name }
            : c.confirmEmail
              ? { kind: 'visit', name: c.name }
              : null;
          /* honest buttons age better: the ship modal asks for tracking */
          const cta = foundRow ? 'Review matches' : c.ship ? 'Add tracking' : c.confirmEmail ? 'Confirm visit' : c.action?.cta;
          const rowClass = `am-row tf-row${amber ? ' tf-needs' : ''}${live ? ' tf-live' : ''}${wrapped ? ' tf-done tf-wraprow' : ''}`;

          return (
            <div key={rowKey} className="am-item">
              <div
                role="button"
                tabIndex={foundRow ? undefined : 0}
                className={rowClass}
                onClick={foundRow ? undefined : () => toggleCrew(rowKey)}
                onKeyDown={foundRow ? undefined : (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCrew(rowKey); } }}
                aria-expanded={foundRow ? undefined : open}
              >
                <span className="am-who">
                  {foundRow ? (
                    <span className="am-avatar am-avatar--blur"><img src={PHOTOS.Amara} alt="" /></span>
                  ) : !c.mystery && PHOTOS[c.name] ? (
                    <span className={wrapped ? 'tf-ring' : undefined}><span className="am-avatar"><img src={PHOTOS[c.name]} alt="" /></span></span>
                  ) : (
                    <span className="am-avatar am-avatar--mystery">?</span>
                  )}
                  <span className="am-names">
                    <span className="am-name">
                      {foundRow ? c.name : c.mystery ? 'Sourcing' : c.name}
                      {!c.mystery && <img src={ICO.check} alt="Verified" className="am-verified" />}
                    </span>
                    <span className="am-handle">{foundRow ? 'To fill your campaign' : c.mystery ? 'New creators for your campaign' : c.handle}</span>
                  </span>
                </span>

                {/* the update line says why; the flag glyph retired — the edge is the flag */}
                <span className={`am-update${amber ? ' tf-uamber' : ''}`}>
                  <LiveStatus status={wrapped ? cleanStatus(c.status) : c.status} />
                </span>

                {/* §3/§4/§5 · the stage slot: chip, amber pill, or postcard */}
                {amber ? (
                  <span className="am-row-cta-slot">
                    <button
                      type="button"
                      className={`tf-abtn${shipDay && c.ship && !sheetDone ? ' tf-abtn--waiting' : ''}`}
                      onClick={(e) => { e.stopPropagation(); if (actModal) setModal(actModal); }}
                    >
                      {cta}
                    </button>
                  </span>
                ) : live ? (
                  <span className="am-row-cta-slot">
                    <button type="button" className="tf-postcard" onClick={(e) => e.stopPropagation()}>💌 Say thanks</button>
                  </span>
                ) : (
                  <span className="tf-chipslot">
                    {c.mystery ? (
                      <span className="tf-chip" style={{ background: '#f1f1f1', color: '#8a8a8a' }}>Sourcing…</span>
                    ) : (
                      <button
                        type="button"
                        className="tf-chip tf-chip--btn"
                        style={{ background: CHIP_FILLS[reached].bg, color: CHIP_FILLS[reached].ink }}
                        title={`Show everyone in ${wrapped ? 'Thanked' : stages[reached].label}`}
                        onClick={(e) => { e.stopPropagation(); onFilter(filter === reached ? null : reached); }}
                      >
                        {wrapped ? 'Thanked' : stages[reached].label}
                      </button>
                    )}
                    {wrapped && !c.mystery && <span className="tf-stamp">💌 Sent</span>}
                  </span>
                )}

                <span className="am-chev">
                  {wrapped && !c.mystery ? (
                    <span className="tf-seepost">See her post ↗</span>
                  ) : (
                    !foundRow && <img src={ICO.chevron} alt="" style={{ rotate: open ? '270deg' : '90deg' }} />
                  )}
                </span>
              </div>
              {open && (
                <div className="am-hist">
                  <p className="am-hist-title">Stage history</p>
                  <div className="cp-crew-history am-hist-body">
                    {timeline.map((st, si) => {
                      const state = c.mystery
                        ? (st.live ? 'now' : st.when ? 'done' : 'next')
                        : si < c.stage ? 'done' : si === c.stage ? 'now' : 'next';
                      return (
                        <div key={si} className={`cp-hist-step cp-hist-step--${state}`} style={{ animationDelay: `${0.05 * si}s` }}>
                          <span className="cp-hist-dot">{state === 'done' ? '✓' : ''}</span>
                          <div className="cp-hist-body">
                            <div className="cp-hist-top">
                              <span className="cp-hist-label">{c.mystery ? st.label : STAGE_LABELS[si]}</span>
                              <span className="cp-hist-when">{state === 'done' ? (st.when || 'done') : state === 'now' ? 'right now' : 'up next'}</span>
                            </div>
                            <div className="cp-hist-detail">{st.detail}</div>
                            {state === 'now' && <div className="cp-hist-live"><LiveStatus status={c.status} /></div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}

      {modal && <ActionModal act={modal} onClose={() => setModal(null)} />}
    </section>
  );
}
