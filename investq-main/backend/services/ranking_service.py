import numpy as np

class RankingService:
    def __init__(self, metrics_svc, esg_svc):
        self._ms = metrics_svc
        self._esg = esg_svc

    def _normalize(self, values):
        """Min-max normalize a list of values to [0, 1]."""
        if not values: return []
        mn, mx = min(values), max(values)
        if mx == mn:
            return [0.5] * len(values)
        return [(v - mn) / (mx - mn) for v in values]

    def compute_rankings(self, esg_weight=0.4, sector='all'):
        all_metrics = self._ms.get_all_metrics()
        tickers = list(all_metrics.keys())

        if sector != 'all':
            tickers = [t for t in tickers 
                       if self._esg.get_esg(t).get('sector') == sector]

        rows = []
        for t in tickers:
            m = all_metrics[t]
            e = self._esg.get_esg(t)
            if not m or not e: continue
            rows.append({
                'ticker': t,
                'return_1y': m.get('return_1y', 0),
                'volatility': m.get('volatility', 0),
                'sharpe': m.get('sharpe', 0),
                'esg_total': e.get('total', 50),
                'esg_rating': e.get('rating', 'N/A'),
                'sector': e.get('sector', 'Unknown'),
            })

        if not rows: return []

        # 1. Normalize components
        ret_norm = self._normalize([r['return_1y'] for r in rows])
        vol_vals = [r['volatility'] for r in rows]
        vol_norm = [1 - v for v in self._normalize(vol_vals)]  # Lower volatility is better
        shrp_norm = self._normalize([r['sharpe'] for r in rows])
        esg_norm = self._normalize([r['esg_total'] for r in rows])

        fin_weight = 1 - esg_weight
        results = []

        # 2. First Pass: Calculate Total Scores for everyone
        for i, row in enumerate(rows):
            fin_score = (ret_norm[i] * 0.4 + vol_norm[i] * 0.3 + shrp_norm[i] * 0.3)
            total_score = (fin_score * fin_weight + esg_norm[i] * esg_weight) * 100
            
            results.append({
                **row,
                'fin_score': round(fin_score * 100, 1),
                'total_score': round(total_score, 1),
                'esg_norm_val': esg_norm[i] # keeping for explanation
            })

        # 3. Dynamic Classification based on Market Percentiles
        all_final_scores = [r['total_score'] for r in results]
        invest_threshold = np.percentile(all_final_scores, 80) # Top 20%
        sell_threshold = np.percentile(all_final_scores, 30)   # Bottom 30%

        # 4. Second Pass: Assign Signals relative to market performance
        for r in results:
            score = r['total_score']
            if score >= invest_threshold:
                r['classification'] = "Invest"
            elif score <= sell_threshold:
                r['classification'] = "Remove"
            else:
                r['classification'] = "Hold"
            
            # Generate the text explanation
            r['explanation'] = self._explain(r, r['fin_score'], r['esg_norm_val'], r['classification'])

        # 5. Sort by rank
        results.sort(key=lambda x: x['total_score'], reverse=True)
        for i, r in enumerate(results):
            r['rank'] = i + 1

        return results

    def _explain(self, row, fin_score, esg_norm, cls):
        parts = []
        if row['return_1y'] > 15: parts.append(f"strong returns ({row['return_1y']}%)")
        if row['volatility'] < 20: parts.append("low risk profile")
        if row['sharpe'] > 1.5: parts.append("excellent efficiency")
        if esg_norm > 0.7: parts.append(f"top-tier ESG ({row['esg_rating']})")

        summary = ', '.join(parts) if parts else "market-average performance"
        return f"Classified as '{cls}' because it is in the {('top' if cls=='Invest' else 'bottom' if cls=='Remove' else 'middle')} tier of analyzed assets with {summary}."