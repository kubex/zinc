---
meta:
  title: Deal Pipeline
  description: Sales pipeline with kanban-style stages and deal cards.
fullWidth: true
---

# Deal Pipeline

A sales pipeline view showing deals organized by stage with value summaries. Demonstrates kanban-style layouts using `zn-cols`, `zn-panel`, and summary statistics.

```html:preview
<zn-pane>
  <zn-sp flush>
    <!-- Header with Stats -->
    <div style="padding: var(--zn-spacing-md);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--zn-spacing-md);">
        <h2 style="margin: 0;">Sales Pipeline</h2>
        <zn-button icon="add">New Deal</zn-button>
      </div>
      <zn-cols layout="1,1,1,1">
        <zn-stat caption="Total Pipeline" value="$847,500"></zn-stat>
        <zn-stat caption="Weighted Value" value="$423,750"></zn-stat>
        <zn-stat caption="Deals" value="18"></zn-stat>
        <zn-stat caption="Avg. Deal Size" value="$47,083"></zn-stat>
      </zn-cols>
    </div>

    <!-- Pipeline Columns -->
    <div style="display: flex; gap: var(--zn-spacing-md); padding: var(--zn-spacing-md); overflow-x: auto;">
      <!-- Lead Column -->
      <div style="min-width: 280px; flex: 1;">
        <zn-panel caption="Lead" style="background: var(--zn-color-neutral-50);">
          <div slot="actions" style="display: flex; align-items: center; gap: var(--zn-spacing-xs);">
            <zn-chip size="small">4</zn-chip>
            <span style="font-size: 12px; color: var(--zn-text-secondary);">$125,000</span>
          </div>
          <zn-sp>
            <zn-panel>
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                  <strong>Acme Corp - Enterprise</strong>
                  <div style="font-size: 12px; color: var(--zn-text-secondary);">Sarah Johnson</div>
                </div>
                <zn-chip size="small" color="info">20%</zn-chip>
              </div>
              <div style="font-size: 18px; font-weight: 600; margin-top: var(--zn-spacing-sm);">$50,000</div>
              <div style="font-size: 12px; color: var(--zn-text-secondary); margin-top: var(--zn-spacing-xs);">Created 2 days ago</div>
            </zn-panel>
            <zn-panel>
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                  <strong>TechStart Initial</strong>
                  <div style="font-size: 12px; color: var(--zn-text-secondary);">Michael Chen</div>
                </div>
                <zn-chip size="small" color="info">20%</zn-chip>
              </div>
              <div style="font-size: 18px; font-weight: 600; margin-top: var(--zn-spacing-sm);">$25,000</div>
              <div style="font-size: 12px; color: var(--zn-text-secondary); margin-top: var(--zn-spacing-xs);">Created 5 days ago</div>
            </zn-panel>
            <zn-panel>
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                  <strong>Globex Expansion</strong>
                  <div style="font-size: 12px; color: var(--zn-text-secondary);">Emma Thompson</div>
                </div>
                <zn-chip size="small" color="info">20%</zn-chip>
              </div>
              <div style="font-size: 18px; font-weight: 600; margin-top: var(--zn-spacing-sm);">$35,000</div>
              <div style="font-size: 12px; color: var(--zn-text-secondary); margin-top: var(--zn-spacing-xs);">Created 1 week ago</div>
            </zn-panel>
            <zn-panel>
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                  <strong>Initech Pilot</strong>
                  <div style="font-size: 12px; color: var(--zn-text-secondary);">James Rodriguez</div>
                </div>
                <zn-chip size="small" color="info">20%</zn-chip>
              </div>
              <div style="font-size: 18px; font-weight: 600; margin-top: var(--zn-spacing-sm);">$15,000</div>
              <div style="font-size: 12px; color: var(--zn-text-secondary); margin-top: var(--zn-spacing-xs);">Created 1 week ago</div>
            </zn-panel>
          </zn-sp>
        </zn-panel>
      </div>

      <!-- Qualified Column -->
      <div style="min-width: 280px; flex: 1;">
        <zn-panel caption="Qualified" style="background: var(--zn-color-neutral-50);">
          <div slot="actions" style="display: flex; align-items: center; gap: var(--zn-spacing-xs);">
            <zn-chip size="small">3</zn-chip>
            <span style="font-size: 12px; color: var(--zn-text-secondary);">$180,000</span>
          </div>
          <zn-sp>
            <zn-panel>
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                  <strong>MegaCorp Platform</strong>
                  <div style="font-size: 12px; color: var(--zn-text-secondary);">Sarah Johnson</div>
                </div>
                <zn-chip size="small" color="warning">40%</zn-chip>
              </div>
              <div style="font-size: 18px; font-weight: 600; margin-top: var(--zn-spacing-sm);">$80,000</div>
              <div style="font-size: 12px; color: var(--zn-text-secondary); margin-top: var(--zn-spacing-xs);">Meeting scheduled</div>
            </zn-panel>
            <zn-panel>
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                  <strong>DataFlow Annual</strong>
                  <div style="font-size: 12px; color: var(--zn-text-secondary);">Michael Chen</div>
                </div>
                <zn-chip size="small" color="warning">40%</zn-chip>
              </div>
              <div style="font-size: 18px; font-weight: 600; margin-top: var(--zn-spacing-sm);">$60,000</div>
              <div style="font-size: 12px; color: var(--zn-text-secondary); margin-top: var(--zn-spacing-xs);">Demo completed</div>
            </zn-panel>
            <zn-panel>
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                  <strong>CloudSync Basic</strong>
                  <div style="font-size: 12px; color: var(--zn-text-secondary);">Emma Thompson</div>
                </div>
                <zn-chip size="small" color="warning">40%</zn-chip>
              </div>
              <div style="font-size: 18px; font-weight: 600; margin-top: var(--zn-spacing-sm);">$40,000</div>
              <div style="font-size: 12px; color: var(--zn-text-secondary); margin-top: var(--zn-spacing-xs);">Requirements gathering</div>
            </zn-panel>
          </zn-sp>
        </zn-panel>
      </div>

      <!-- Proposal Column -->
      <div style="min-width: 280px; flex: 1;">
        <zn-panel caption="Proposal" style="background: var(--zn-color-neutral-50);">
          <div slot="actions" style="display: flex; align-items: center; gap: var(--zn-spacing-xs);">
            <zn-chip size="small">2</zn-chip>
            <span style="font-size: 12px; color: var(--zn-text-secondary);">$175,000</span>
          </div>
          <zn-sp>
            <zn-panel>
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                  <strong>Enterprise Solutions</strong>
                  <div style="font-size: 12px; color: var(--zn-text-secondary);">James Rodriguez</div>
                </div>
                <zn-chip size="small" color="success">60%</zn-chip>
              </div>
              <div style="font-size: 18px; font-weight: 600; margin-top: var(--zn-spacing-sm);">$100,000</div>
              <div style="font-size: 12px; color: var(--zn-text-secondary); margin-top: var(--zn-spacing-xs);">Proposal sent</div>
            </zn-panel>
            <zn-panel>
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                  <strong>Retail Pro Bundle</strong>
                  <div style="font-size: 12px; color: var(--zn-text-secondary);">Sarah Johnson</div>
                </div>
                <zn-chip size="small" color="success">60%</zn-chip>
              </div>
              <div style="font-size: 18px; font-weight: 600; margin-top: var(--zn-spacing-sm);">$75,000</div>
              <div style="font-size: 12px; color: var(--zn-text-secondary); margin-top: var(--zn-spacing-xs);">Under review</div>
            </zn-panel>
          </zn-sp>
        </zn-panel>
      </div>

      <!-- Negotiation Column -->
      <div style="min-width: 280px; flex: 1;">
        <zn-panel caption="Negotiation" style="background: var(--zn-color-neutral-50);">
          <div slot="actions" style="display: flex; align-items: center; gap: var(--zn-spacing-xs);">
            <zn-chip size="small">2</zn-chip>
            <span style="font-size: 12px; color: var(--zn-text-secondary);">$165,000</span>
          </div>
          <zn-sp>
            <zn-panel>
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                  <strong>FinanceHub Premium</strong>
                  <div style="font-size: 12px; color: var(--zn-text-secondary);">Michael Chen</div>
                </div>
                <zn-chip size="small" color="success">80%</zn-chip>
              </div>
              <div style="font-size: 18px; font-weight: 600; margin-top: var(--zn-spacing-sm);">$90,000</div>
              <div style="font-size: 12px; color: var(--zn-text-secondary); margin-top: var(--zn-spacing-xs);">Contract review</div>
            </zn-panel>
            <zn-panel>
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                  <strong>LogiTech Suite</strong>
                  <div style="font-size: 12px; color: var(--zn-text-secondary);">Emma Thompson</div>
                </div>
                <zn-chip size="small" color="success">80%</zn-chip>
              </div>
              <div style="font-size: 18px; font-weight: 600; margin-top: var(--zn-spacing-sm);">$75,000</div>
              <div style="font-size: 12px; color: var(--zn-text-secondary); margin-top: var(--zn-spacing-xs);">Final terms</div>
            </zn-panel>
          </zn-sp>
        </zn-panel>
      </div>

      <!-- Won Column -->
      <div style="min-width: 280px; flex: 1;">
        <zn-panel caption="Won" style="background: var(--zn-color-success-50);">
          <div slot="actions" style="display: flex; align-items: center; gap: var(--zn-spacing-xs);">
            <zn-chip size="small" color="success">2</zn-chip>
            <span style="font-size: 12px; color: var(--zn-text-secondary);">$202,500</span>
          </div>
          <zn-sp>
            <zn-panel>
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                  <strong>HealthCare Plus</strong>
                  <div style="font-size: 12px; color: var(--zn-text-secondary);">James Rodriguez</div>
                </div>
                <zn-chip size="small" color="success">Won</zn-chip>
              </div>
              <div style="font-size: 18px; font-weight: 600; margin-top: var(--zn-spacing-sm);">$120,000</div>
              <div style="font-size: 12px; color: var(--zn-text-secondary); margin-top: var(--zn-spacing-xs);">Closed Jan 28</div>
            </zn-panel>
            <zn-panel>
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                  <strong>EduTech License</strong>
                  <div style="font-size: 12px; color: var(--zn-text-secondary);">Sarah Johnson</div>
                </div>
                <zn-chip size="small" color="success">Won</zn-chip>
              </div>
              <div style="font-size: 18px; font-weight: 600; margin-top: var(--zn-spacing-sm);">$82,500</div>
              <div style="font-size: 12px; color: var(--zn-text-secondary); margin-top: var(--zn-spacing-xs);">Closed Jan 25</div>
            </zn-panel>
          </zn-sp>
        </zn-panel>
      </div>
    </div>
  </zn-sp>
</zn-pane>
```

**Components demonstrated:** `zn-panel`, `zn-stat`, `zn-chip`, `zn-sp`, `zn-cols`, `zn-button`
