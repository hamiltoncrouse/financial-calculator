(() => {
  const $ = (id) => document.getElementById(id);
  const fmt = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });

  const num = (v) => {
    const n = Number(String(v).replace(/[^0-9.+-]/g, ''));
    return Number.isFinite(n) ? n : 0;
  };

  // Theme
  const root = document.documentElement;
  const getTheme = () => localStorage.getItem('fin-theme') || 'night';
  const setTheme = (t) => {
    localStorage.setItem('fin-theme', t);
    if (t === 'day') {
      root.setAttribute('data-theme', 'day');
      $('modeLabel').textContent = 'Day';
    } else {
      root.removeAttribute('data-theme');
      $('modeLabel').textContent = 'Night';
    }
  };
  setTheme(getTheme());
  $('mode')?.addEventListener('click', () => setTheme(getTheme() === 'night' ? 'day' : 'night'));

  // Loan: amortizing payment
  const loanPayment = (P, aprPct, years) => {
    const r = (aprPct / 100) / 12;
    const n = Math.max(1, Math.round(years * 12));
    if (r === 0) return P / n;
    const pow = Math.pow(1 + r, n);
    return P * r * pow / (pow - 1);
  };

  $('loanCalc')?.addEventListener('click', () => {
    const P = num($('loanPrincipal').value);
    const apr = num($('loanApr').value);
    const years = num($('loanYears').value);
    const pay = loanPayment(P, apr, years);
    $('loanPayment').textContent = fmt.format(pay);
  });

  // Savings: month-by-month simulation
  const savings = ({ start, monthly, apyPct, years }) => {
    const n = Math.max(1, Math.round(years * 12));
    const r = (apyPct / 100) / 12;
    let bal = start;
    let contrib = 0;
    for (let i = 0; i < n; i++) {
      bal += monthly;
      contrib += monthly;
      bal *= (1 + r);
    }
    const interest = bal - start - contrib;
    return { bal, contrib, interest };
  };

  $('savCalc')?.addEventListener('click', () => {
    const start = num($('savStart').value);
    const monthly = num($('savMonthly').value);
    const apy = num($('savApy').value);
    const years = num($('savYears').value);

    const r = savings({ start, monthly, apyPct: apy, years });
    $('savEnd').textContent = fmt.format(r.bal);
    $('savBreakdown').textContent = `Contributions: ${fmt.format(r.contrib)} · Growth: ${fmt.format(r.interest)}`;
  });

  // Compound interest (lump sum)
  const compound = (P, ratePct, n, years) => {
    const r = ratePct / 100;
    const k = Math.max(1, Math.round(n));
    const t = years;
    return P * Math.pow(1 + (r / k), k * t);
  };

  $('ciCalc')?.addEventListener('click', () => {
    const P = num($('ciPrincipal').value);
    const rate = num($('ciRate').value);
    const n = num($('ciN').value);
    const years = num($('ciYears').value);
    const fv = compound(P, rate, n, years);
    $('ciFuture').textContent = fmt.format(fv);
  });

  // Copy URL
  $('copy')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      $('copy').textContent = 'Copied!';
      setTimeout(() => ($('copy').textContent = 'Copy shareable URL'), 1100);
    } catch {
      // ignore
    }
  });

  // initial compute
  $('loanCalc')?.click();
  $('savCalc')?.click();
  $('ciCalc')?.click();
})();
