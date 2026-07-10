import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Topbar } from '../layout/Topbar';
import { ROUTE_NAMES } from '../../constants';

const SSH_CONFIG_SNIPPET = `Host ssh-gw.khu-return.com rcp-gw
  HostName ssh-gw.khu-return.com
  User any
  ProxyCommand cloudflared access ssh --hostname %h`;

const SSH_CONNECT_COMMAND = 'ssh rcp-gw';

interface GuideStep {
  title: string;
  description: string;
  code?: string;
}

const steps: GuideStep[] = [
  {
    title: 'Add the gateway to your SSH config',
    description:
      '로컬 ~/.ssh/config 파일에 아래 Host 블록을 추가하세요. Cloudflare Access를 통해 SSH 게이트웨이로 연결됩니다.',
    code: SSH_CONFIG_SNIPPET,
  },
  {
    title: 'Connect from your terminal',
    description: '터미널에서 아래 명령어로 게이트웨이에 접속하세요.',
    code: SSH_CONNECT_COMMAND,
  },
  {
    title: 'Authenticate in the browser',
    description:
      '명령을 실행하면 인증 URL이 출력됩니다. 이 URL을 열고 터미널에 표시된 6자리 코드를 입력한 뒤 Google 계정으로 로그인하세요. 코드는 약 5분 후 만료됩니다.',
  },
  {
    title: 'Pick your instance',
    description:
      '인증이 완료되면 터미널로 자동으로 돌아갑니다. 표시되는 메뉴에서 접속할 인스턴스를 선택하면 SSH 세션이 시작됩니다.',
  },
];

export function SshGuidePage() {
  const navigate = useNavigate();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  async function handleCopy(index: number, code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(index);
      window.setTimeout(
        () => setCopiedIndex((current) => (current === index ? null : current)),
        1400,
      );
    } catch {
      // clipboard not available — silently ignore
    }
  }

  return (
    <div className="page page-instances shell-enter">
      <Topbar active={ROUTE_NAMES.detail} />
      <main className="workspace workspace-list">
        <section className="workspace-main list-main">
          <section className="editor-section editor-section-flat">
            <div className="section-head section-head-tight">
              <div>
                <p className="eyebrow">Compute</p>
                <h2>Connect via SSH</h2>
                <p className="muted section-support">
                  네이티브 SSH 클라이언트로 인스턴스에 접속하는 방법을 안내합니다.
                </p>
              </div>
              <div className="action-row compact">
                <button type="button" className="ghost-button" onClick={() => navigate('/compute')}>
                  Back to instances
                </button>
              </div>
            </div>

            <ol className="guide-steps">
              {steps.map((step, index) => (
                <li key={step.title} className="guide-step">
                  <span className="guide-step-index">{index + 1}</span>
                  <div className="guide-step-body">
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                    {step.code && (
                      <div className="guide-code">
                        <pre>
                          <code>{step.code}</code>
                        </pre>
                        <button
                          type="button"
                          className="copy-button"
                          onClick={() => void handleCopy(index, step.code as string)}
                        >
                          {copiedIndex === index ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </section>
      </main>
    </div>
  );
}
