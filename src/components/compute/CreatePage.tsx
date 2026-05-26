import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { Topbar } from '../layout/Topbar';
import { SectionRail } from './SectionRail';
import { FlavorTable } from './FlavorTable';
import { ROUTE_NAMES, imageTemplates, SECTION_ORDER } from '../../constants';
import { validateName, validatePublicKey, formatRam } from '../../utils';
import type { SectionStates } from '../../types';

function imageMarkVariant(key: string): 'ubuntu' | 'rocky' | 'cirros' | 'default' {
  if (key.includes('ubuntu')) return 'ubuntu';
  if (key.includes('rocky')) return 'rocky';
  if (key.includes('cirros')) return 'cirros';
  return 'default';
}

function ImageMarkIcon({ variant }: { variant: ReturnType<typeof imageMarkVariant> }) {
  if (variant === 'ubuntu') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden focusable="false">
        <circle cx="5.4" cy="12" r="2.3" />
        <circle cx="15" cy="6.7" r="2.3" />
        <circle cx="15" cy="17.3" r="2.3" />
        <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }
  if (variant === 'rocky') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden focusable="false">
        <path d="M3.5 18.5 L9 9.5 L12.5 14 L16.5 7.5 L20.5 18.5 Z" />
      </svg>
    );
  }
  if (variant === 'cirros') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden focusable="false">
        <path d="M7.2 17.8h9.6a3.6 3.6 0 0 0 .55-7.16 5.1 5.1 0 0 0-9.7-1.04A4 4 0 0 0 7.2 17.8z" />
      </svg>
    );
  }
  return <span className="image-card-mark-fallback">?</span>;
}

export function CreatePage() {
  const navigate = useNavigate();
  const {
    draft,
    updateDraft,
    flavors,
    keypairStatus,
    creationStatus,
    ensureFlavorData,
    handleKeypairRegistration,
    handleCreateInstance,
    getSelectedFlavor,
  } = useStore();

  useEffect(() => {
    void ensureFlavorData();
  }, [ensureFlavorData]);

  const selectedFlavor = getSelectedFlavor();
  const imageTemplate = imageTemplates.find((t) => t.key === draft.imageTemplate) ?? null;
  const resolvedImageId = imageTemplate?.id ?? draft.imageId.trim();
  const selectedImageLabel = imageTemplate?.label ?? '이미지 선택 필요';

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
    'image-network': {
      title: 'Image',
      valid: Boolean(resolvedImageId),
      error: !resolvedImageId,
    },
    compute: {
      title: 'Compute sizing',
      valid: Boolean(selectedFlavor && selectedFlavor.max_configurable > 0),
      error: Boolean(selectedFlavor && selectedFlavor.max_configurable === 0),
    },
    access: {
      title: 'Access',
      valid: keypairStatus.state === 'saved' || (!keyNamePresent && !publicKeyPresent),
      error: Boolean((keyNamePresent && !keyNameValid) || (publicKeyPresent && !publicKeyValid)),
    },
    review: {
      title: 'Review',
      valid:
        validateName(draft.name) &&
        Boolean(selectedFlavor) &&
        (selectedFlavor?.max_configurable ?? 0) > 0 &&
        Boolean(resolvedImageId),
      error: false,
    },
  };

  const payload = {
    name: draft.name.trim(),
    image_id: resolvedImageId,
    flavor_id: draft.selectedFlavorId,
    ...(keypairStatus.response?.name ? { key_name: keypairStatus.response.name } : {}),
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

  function handleSelectImage(templateKey: string) {
    const template = imageTemplates.find((item) => item.key === templateKey);
    if (!template) return;
    updateDraft({
      imageTemplate: template.key,
      imageAssistEnabled: true,
      imageId: template.id,
    });
  }

  return (
    <div className="page page-create shell-enter">
      <Topbar active={ROUTE_NAMES.create} />
      <main className="workspace">
        <SectionRail sections={sections} />

        <section className="workspace-main">
          <section className="notice-strip create-strip">
            <div>
              <strong>Compute / Create</strong>
              <p>
                {selectedFlavor
                  ? `${selectedFlavor.name} 기준으로 인스턴스를 준비합니다.`
                  : '인스턴스 생성 설정을 확인합니다.'}
              </p>
            </div>
            <ul>
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

          {/* Image */}
          <section className="editor-section" id="image-network">
            <div className="section-head">
              <div>
                <p className="eyebrow">02 · Image</p>
                <h2>이미지</h2>
              </div>
              <p className="muted">사용할 OS 템플릿을 선택합니다.</p>
            </div>

            <div
              className="image-grid"
              data-ui="image-template"
              role="radiogroup"
              aria-label="Image template"
            >
              {imageTemplates.map((item) => {
                const selected = draft.imageTemplate === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={`image-card${selected ? ' is-selected' : ''}`}
                    onClick={() => handleSelectImage(item.key)}
                    data-key={item.key}
                  >
                    <span
                      className={`image-card-mark image-card-mark-${imageMarkVariant(item.key)}`}
                      aria-hidden
                    >
                      <ImageMarkIcon variant={imageMarkVariant(item.key)} />
                    </span>
                    <span className="image-card-body">
                      <strong>{item.label}</strong>
                      <small className="muted">{item.description}</small>
                    </span>
                    <span className="image-card-check" aria-hidden>
                      {selected ? '✓' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Compute */}
          <section className="editor-section" id="compute">
            <div className="section-head">
              <div>
                <p className="eyebrow">03 · Sizing</p>
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
                  <li>
                    <strong>Name</strong>
                    <span>{payload.name || '-'}</span>
                  </li>
                  <li>
                    <strong>Flavor</strong>
                    <span>{selectedFlavor?.name ?? '-'}</span>
                  </li>
                  <li>
                    <strong>Resources</strong>
                    <span>
                      {selectedFlavor
                        ? `${selectedFlavor.vcpus} vCPU · ${formatRam(selectedFlavor.ram)} · ${selectedFlavor.disk} GB disk`
                        : '-'}
                    </span>
                  </li>
                  <li>
                    <strong>Image</strong>
                    <span>{selectedImageLabel}</span>
                  </li>
                  <li>
                    <strong>SSH key</strong>
                    <span>{keypairStatus.response?.name ?? 'Optional'}</span>
                  </li>
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
                    onClick={() =>
                      document.getElementById('basic')?.scrollIntoView({ behavior: 'smooth' })
                    }
                  >
                    Back to edit
                  </button>
                </div>
              </div>
              <pre className="code-block" data-ui="payload-preview">
                {JSON.stringify(
                  {
                    name: payload.name,
                    flavor: selectedFlavor?.name ?? '',
                    image: selectedImageLabel,
                    ssh_key: keypairStatus.response?.name ?? 'Optional',
                  },
                  null,
                  2,
                )}
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
            <div>
              <dt>Flavor</dt>
              <dd>{selectedFlavor?.name ?? 'Not selected'}</dd>
            </div>
            <div>
              <dt>Quota impact</dt>
              <dd>
                {selectedFlavor
                  ? `${selectedFlavor.vcpus} vCPU / ${formatRam(selectedFlavor.ram)}`
                  : '-'}
              </dd>
            </div>
            <div>
              <dt>Max creatable</dt>
              <dd>{selectedFlavor ? selectedFlavor.max_configurable : '-'}</dd>
            </div>
            <div>
              <dt>Image</dt>
              <dd>{selectedImageLabel}</dd>
            </div>
            <div>
              <dt>SSH key</dt>
              <dd>{keypairStatus.response?.name ?? 'Not registered'}</dd>
            </div>
          </dl>
          <div className="summary-checks" data-ui="summary-checks">
            {SECTION_ORDER.map((key) => {
              const section = sections[key];
              return (
                <div
                  key={key}
                  className={`check-row ${section.error ? 'error' : section.valid ? 'valid' : 'pending'}`}
                >
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
