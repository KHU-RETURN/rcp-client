import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { Topbar } from '../layout/Topbar';
import { SectionRail } from './SectionRail';
import { FlavorTable } from './FlavorTable';
import { ROUTE_NAMES, imageTemplates, networkTemplates, SECTION_ORDER } from '../../constants';
import { validateName, validatePublicKey, formatRam } from '../../utils';
import type { SectionStates } from '../../types';

export function CreatePage() {
  const navigate = useNavigate();
  const {
    draft,
    updateDraft,
    syncAssistFields,
    flavors,
    keypairStatus,
    creationStatus,
    connectionMode,
    ensureFlavorData,
    handleKeypairRegistration,
    handleCreateInstance,
    getSelectedFlavor,
    getAppHealth,
  } = useStore();

  useEffect(() => {
    void ensureFlavorData();
  }, [ensureFlavorData]);

  const health = getAppHealth();
  const selectedFlavor = getSelectedFlavor();
  const imageTemplate = imageTemplates.find((t) => t.key === draft.imageTemplate) ?? null;
  const networkTemplate = networkTemplates.find((t) => t.key === draft.networkTemplate) ?? null;

  const publicKeyPresent = draft.publicKey.trim().length > 0;
  const keyNamePresent = draft.keypairName.trim().length > 0;
  const keyNameValid = draft.keypairName.trim().length >= 2;
  const publicKeyValid = !publicKeyPresent || validatePublicKey(draft.publicKey);

  const sections: SectionStates = {
    basic: {
      title: 'Basic information',
      valid: validateName(draft.name),
      error: draft.name.trim().length > 0 && !validateName(draft.name),
    },
    compute: {
      title: 'Compute sizing',
      valid: Boolean(selectedFlavor && selectedFlavor.max_configurable > 0),
      error: Boolean(selectedFlavor && selectedFlavor.max_configurable === 0),
    },
    'image-network': {
      title: 'Image & network',
      valid: Boolean(draft.imageId.trim()),
      error: !draft.imageId.trim(),
    },
    access: {
      title: 'Access',
      valid:
        keypairStatus.state === 'saved' ||
        keypairStatus.state === 'demo' ||
        (!keyNamePresent && !publicKeyPresent),
      error: Boolean((keyNamePresent && !keyNameValid) || (publicKeyPresent && !publicKeyValid)),
    },
    review: {
      title: 'Review',
      valid:
        validateName(draft.name) &&
        Boolean(selectedFlavor) &&
        (selectedFlavor?.max_configurable ?? 0) > 0 &&
        Boolean(draft.imageId.trim()),
      error: false,
    },
  };

  const payload = {
    name: draft.name.trim(),
    image_id: draft.imageId.trim(),
    flavor_id: draft.selectedFlavorId,
    ...(draft.networkId.trim() ? { network_id: draft.networkId.trim() } : {}),
  };

  const canCreate = sections.review.valid && creationStatus.state !== 'saving';

  async function handleCreate() {
    const nextPath = await handleCreateInstance();
    if (nextPath) navigate(nextPath);
  }

  function handleSelectFlavor(flavorId: string) {
    const f = flavors.find((fl) => fl.id === flavorId);
    if (!f || f.max_configurable === 0) return;
    updateDraft({ selectedFlavorId: flavorId });
  }

  return (
    <div className="page page-create shell-enter">
      <Topbar active={ROUTE_NAMES.create} />
      <main className="workspace">
        <SectionRail sections={sections} />

        <section className="workspace-main">
          <section className={`notice-strip create-strip ${health.tone}`}>
            <div>
              <strong>Compute / Create</strong>
              <p>
                {selectedFlavor
                  ? `${selectedFlavor.name} 기준으로 인스턴스를 준비합니다.`
                  : '인스턴스 생성 설정을 확인합니다.'}
              </p>
            </div>
            <ul>
              <li>{health.label}</li>
              <li>{draft.imageId ? 'Image ready' : 'Image required'}</li>
              <li>{keypairStatus.response?.name ? 'SSH ready' : 'SSH optional'}</li>
            </ul>
          </section>

          {/* Basic */}
          <section className="editor-section" id="basic">
            <div className="section-head">
              <div>
                <p className="eyebrow">01 · Basic</p>
                <h2>기본 정보</h2>
              </div>
              <p className="muted">이름과 메모를 정리합니다.</p>
            </div>
            <div className="field-grid">
              <label className="field">
                <span>VM name *</span>
                <input
                  data-ui="vm-name"
                  name="name"
                  type="text"
                  placeholder="lab-api-01"
                  value={draft.name}
                  onChange={(e) => updateDraft({ name: e.target.value })}
                />
                <small>
                  {draft.name && !validateName(draft.name)
                    ? '영문/숫자와 하이픈만 사용하고 2~32자를 권장합니다.'
                    : '예: course-web-01, return-gpu-lab'}
                </small>
              </label>
              <label className="field field-wide">
                <span>Operator note</span>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="용도, 담당자, 수업명 등을 짧게 적습니다."
                  value={draft.description}
                  onChange={(e) => updateDraft({ description: e.target.value })}
                />
                <small>목록과 상세에서 같이 보입니다.</small>
              </label>
            </div>
          </section>

          {/* Compute */}
          <section className="editor-section" id="compute">
            <div className="section-head">
              <div>
                <p className="eyebrow">02 · Sizing</p>
                <h2>사양</h2>
              </div>
              <p className="muted">quota 기준으로 선택합니다.</p>
            </div>
            <div className="table-frame">
              <FlavorTable
                selectedFlavorId={draft.selectedFlavorId}
                onSelectFlavor={handleSelectFlavor}
              />
            </div>
          </section>

          {/* Image & Network */}
          <section className="editor-section" id="image-network">
            <div className="section-head">
              <div>
                <p className="eyebrow">03 · Image / Network</p>
                <h2>이미지 · 네트워크</h2>
              </div>
              <p className="muted">assist 또는 직접 입력으로 설정합니다.</p>
            </div>

            <div className="paired-blocks">
              <section className="line-block">
                <div className="line-block-head">
                  <div>
                    <strong>Image assist</strong>
                    <p className="muted">preset을 고르면 image ID를 채워 줍니다.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      name="imageAssistEnabled"
                      checked={draft.imageAssistEnabled}
                      onChange={(e) => syncAssistFields('imageAssistEnabled', null, e.target.checked)}
                    />
                    <span>guided</span>
                  </label>
                </div>
                {draft.imageAssistEnabled && (
                  <label className="field">
                    <span>Image template</span>
                    <select
                      data-ui="image-template"
                      name="imageTemplate"
                      value={draft.imageTemplate}
                      onChange={(e) => syncAssistFields('imageTemplate', e.target.value, false)}
                    >
                      {imageTemplates.map((item) => (
                        <option key={item.key} value={item.key}>{item.label}</option>
                      ))}
                    </select>
                    <small>{imageTemplate?.description ?? ''}</small>
                  </label>
                )}
                <label className="field">
                  <span>Image ID *</span>
                  <input
                    data-ui="image-id"
                    name="imageId"
                    type="text"
                    placeholder="image-uuid"
                    value={draft.imageId}
                    onChange={(e) => updateDraft({ imageId: e.target.value })}
                  />
                  <small>실운영에서는 유효한 OpenStack image ID가 필요합니다.</small>
                </label>
              </section>

              <section className="line-block">
                <div className="line-block-head">
                  <div>
                    <strong>Network assist</strong>
                    <p className="muted">network는 선택값입니다. 비우면 payload에서 빠집니다.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      name="networkAssistEnabled"
                      checked={draft.networkAssistEnabled}
                      onChange={(e) => syncAssistFields('networkAssistEnabled', null, e.target.checked)}
                    />
                    <span>guided</span>
                  </label>
                </div>
                {draft.networkAssistEnabled && (
                  <label className="field">
                    <span>Network template</span>
                    <select
                      data-ui="network-template"
                      name="networkTemplate"
                      value={draft.networkTemplate}
                      onChange={(e) => syncAssistFields('networkTemplate', e.target.value, false)}
                    >
                      {networkTemplates.map((item) => (
                        <option key={item.key} value={item.key}>{item.label}</option>
                      ))}
                    </select>
                    <small>{networkTemplate?.description ?? ''}</small>
                  </label>
                )}
                <label className="field">
                  <span>Network ID</span>
                  <input
                    data-ui="network-id"
                    name="networkId"
                    type="text"
                    placeholder="optional network-uuid"
                    value={draft.networkId}
                    onChange={(e) => updateDraft({ networkId: e.target.value })}
                  />
                  <small>비워두면 optional 값으로 처리됩니다.</small>
                </label>
              </section>
            </div>
          </section>

          {/* Access */}
          <section className="editor-section" id="access">
            <div className="section-head">
              <div>
                <p className="eyebrow">04 · Access</p>
                <h2>접근</h2>
              </div>
              <p className="muted">SSH 키 등록은 선택입니다.</p>
            </div>

            <div className="field-grid field-grid-access">
              <label className="field">
                <span>KeyPair name</span>
                <input
                  data-ui="keypair-name"
                  name="keypairName"
                  type="text"
                  placeholder="return-lab-key"
                  value={draft.keypairName}
                  onChange={(e) => updateDraft({ keypairName: e.target.value })}
                />
                <small>짧고 재사용 가능한 이름을 추천합니다.</small>
              </label>
              <label className="field field-wide">
                <span>Public key</span>
                <textarea
                  data-ui="public-key"
                  name="publicKey"
                  rows={4}
                  placeholder="ssh-ed25519 AAAA... user@example"
                  value={draft.publicKey}
                  onChange={(e) => updateDraft({ publicKey: e.target.value })}
                />
                <small>OpenSSH 형식을 그대로 붙여넣으세요.</small>
              </label>
            </div>

            <div className="action-row">
              <button
                className="primary-button secondary-tone"
                data-ui="register-key"
                disabled={keypairStatus.state === 'saving'}
                onClick={() => void handleKeypairRegistration()}
              >
                {keypairStatus.state === 'saving' ? '등록 중...' : 'Register key'}
              </button>
              {keypairStatus.message && (
                <p className={`inline-status ${keypairStatus.state}`} aria-live="polite">
                  {keypairStatus.message}
                </p>
              )}
            </div>

            {keypairStatus.response && (
              <div className="receipt-bar" data-ui="key-receipt">
                <strong>{keypairStatus.response.name}</strong>
                <span>Fingerprint {keypairStatus.response.fingerprint || 'generated'}</span>
              </div>
            )}
          </section>

          {/* Review */}
          <section className="editor-section" id="review">
            <div className="section-head">
              <div>
                <p className="eyebrow">05 · Review</p>
                <h2>검토</h2>
              </div>
              <p className="muted">생성 전에 최종 값을 확인합니다.</p>
            </div>

            <div className="review-layout">
              <div className="review-copy">
                <ul className="review-rows">
                  <li><strong>Name</strong><span>{payload.name || '-'}</span></li>
                  <li><strong>Flavor</strong><span>{selectedFlavor?.name ?? '-'}</span></li>
                  <li>
                    <strong>Resources</strong>
                    <span>
                      {selectedFlavor
                        ? `${selectedFlavor.vcpus} vCPU · ${formatRam(selectedFlavor.ram)} · ${selectedFlavor.disk} GB disk`
                        : '-'}
                    </span>
                  </li>
                  <li><strong>Image</strong><span>{payload.image_id || '-'}</span></li>
                  <li><strong>Network</strong><span>{payload.network_id ?? 'Not set'}</span></li>
                  <li><strong>SSH key</strong><span>{keypairStatus.response?.name ?? 'Optional'}</span></li>
                </ul>
                {creationStatus.message && (
                  <p className={`inline-status ${creationStatus.state}`} aria-live="polite">
                    {creationStatus.message}
                  </p>
                )}
                <div className="action-row compact">
                  <button
                    className="primary-button"
                    data-ui="create-vm"
                    disabled={!canCreate}
                    onClick={() => void handleCreate()}
                  >
                    {creationStatus.state === 'saving' ? 'Creating...' : 'Create instance'}
                  </button>
                  <button
                    className="ghost-button"
                    onClick={() => document.getElementById('basic')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Back to edit
                  </button>
                </div>
              </div>
              <pre className="code-block" data-ui="payload-preview">
                {JSON.stringify(payload, null, 2)}
              </pre>
            </div>
          </section>
        </section>

        {/* Summary sidebar */}
        <aside className="workspace-summary">
          <div className="summary-headline">
            <p className="eyebrow">Create review</p>
            <h2 data-ui="summary-name">{draft.name || 'Untitled VM'}</h2>
          </div>
          <dl className="summary-grid">
            <div><dt>Mode</dt><dd>{connectionMode === 'live' ? 'Live API' : 'Demo fallback'}</dd></div>
            <div><dt>Flavor</dt><dd>{selectedFlavor?.name ?? 'Not selected'}</dd></div>
            <div><dt>Quota impact</dt><dd>{selectedFlavor ? `${selectedFlavor.vcpus} vCPU / ${formatRam(selectedFlavor.ram)}` : '-'}</dd></div>
            <div><dt>Max creatable</dt><dd>{selectedFlavor ? selectedFlavor.max_configurable : '-'}</dd></div>
            <div><dt>Image</dt><dd>{draft.imageId || 'Required'}</dd></div>
            <div><dt>Network</dt><dd>{draft.networkId || 'Optional'}</dd></div>
            <div><dt>SSH key</dt><dd>{keypairStatus.response?.name ?? 'Not registered'}</dd></div>
          </dl>
          <div className="summary-checks" data-ui="summary-checks">
            {SECTION_ORDER.map((key) => {
              const section = sections[key];
              return (
                <div key={key} className={`check-row ${section.error ? 'error' : section.valid ? 'valid' : 'pending'}`}>
                  <span>{section.title}</span>
                  <strong>{section.error ? 'Fix' : section.valid ? 'Ready' : 'Pending'}</strong>
                </div>
              );
            })}
          </div>
          <div className="summary-note">
            <strong>Note</strong>
            <p>{draft.description || 'No note'}</p>
          </div>
        </aside>
      </main>
    </div>
  );
}
