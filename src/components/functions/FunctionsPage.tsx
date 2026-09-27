import { useCallback, useEffect, useState } from 'react';
import { ROUTE_NAMES } from '../../constants';
import { rcpConfig } from '../../config';
import {
  bindDatabase,
  createDatabase,
  deleteDatabase,
  listDatabaseBindings,
  listDatabases,
  queryDatabase,
  unbindDatabase,
} from '../../services/databases';
import {
  createFunction,
  deleteFunction,
  deleteFunctionData,
  getFunctionData,
  invokeFunction,
  issueFunctionKey,
  listFunctions,
  listFunctionData,
  putFunctionData,
  revokeFunctionKey,
  updateFunction,
} from '../../services/functions';
import { buildApiUrl } from '../../services/api';
import type {
  CloudFunction,
  AppDatabase,
  DatabaseBinding,
  FunctionDataItem,
  FunctionLanguage,
  FunctionResult,
  SQLResult,
} from '../../types/functions';
import { Topbar } from '../layout/Topbar';

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", `'"'"'`)}'`;
}

export function FunctionsPage() {
  const [items, setItems] = useState<CloudFunction[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [language, setLanguage] = useState<FunctionLanguage>('rust');
  const [dataMode, setDataMode] = useState(false);
  const [databases, setDatabases] = useState<AppDatabase[]>([]);
  const [databaseName, setDatabaseName] = useState('');
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [sql, setSQL] = useState('SELECT name FROM sqlite_master WHERE type = ?');
  const [sqlParams, setSQLParams] = useState('["table"]');
  const [sqlResult, setSQLResult] = useState<SQLResult | null>(null);
  const [bindings, setBindings] = useState<DatabaseBinding[]>([]);
  const [bindingAlias, setBindingAlias] = useState('DB');
  const [bindingDatabase, setBindingDatabase] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [replacement, setReplacement] = useState<File | null>(null);
  const [replacementLanguage, setReplacementLanguage] = useState<FunctionLanguage>('rust');
  const [replacementDataMode, setReplacementDataMode] = useState(false);
  const [input, setInput] = useState('{}');
  const [result, setResult] = useState<FunctionResult | null>(null);
  const [dataCollection, setDataCollection] = useState('default');
  const [dataKey, setDataKey] = useState('');
  const [dataValue, setDataValue] = useState('{}');
  const [dataItems, setDataItems] = useState<FunctionDataItem[]>([]);
  const [issuedKey, setIssuedKey] = useState<string | null>(null);
  const [curlCopied, setCurlCopied] = useState(false);
  const [keyDays, setKeyDays] = useState(30);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const next = await listFunctions();
    setItems(next);
    setSelected((current) =>
      next.some((item) => item.id === current) ? current : (next[0]?.id ?? null),
    );
  }, []);

  const refreshDatabases = useCallback(async () => {
    const next = await listDatabases();
    setDatabases(next);
    setSelectedDatabase((current) =>
      next.some((item) => item.id === current) ? current : (next[0]?.id ?? ''),
    );
    setBindingDatabase((current) =>
      next.some((item) => item.id === current) ? current : (next[0]?.id ?? ''),
    );
  }, []);

  useEffect(() => {
    void Promise.all([refresh(), refreshDatabases()])
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : '함수 목록을 불러오지 못했습니다.');
      })
      .finally(() => setLoading(false));
  }, [refresh, refreshDatabases]);

  const active = items.find((item) => item.id === selected);
  const selectedDatabaseItem = databases.find((item) => item.id === selectedDatabase);

  const refreshBindings = useCallback(async () => {
    setBindings(selected ? await listDatabaseBindings(selected) : []);
  }, [selected]);

  useEffect(() => {
    void refreshBindings().catch(() => setBindings([]));
  }, [refreshBindings]);
  const endpoint = active
    ? new URL(buildApiUrl(`/api/v1/run/${active.id}/`), window.location.origin).toString()
    : '';
  const curlExample = String.raw`curl --request POST ${shellQuote(endpoint)} \
  --header "Authorization: Bearer ${'$'}FUNCTION_KEY" \
  --header 'Content-Type: application/json' \
  --data-binary ${shellQuote(input)}`;

  useEffect(() => {
    setReplacementLanguage(active?.language ?? 'rust');
    setReplacementDataMode(active?.data_mode ?? false);
    setReplacement(null);
  }, [active?.language, active?.data_mode]);

  const refreshData = useCallback(async () => {
    if (!selected) {
      setDataItems([]);
      return;
    }
    setDataItems(await listFunctionData(selected, dataCollection));
  }, [selected, dataCollection]);

  useEffect(() => {
    void refreshData().catch(() => setDataItems([]));
  }, [refreshData]);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '요청에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page page-instances shell-enter">
      <Topbar active={ROUTE_NAMES.functions} />
      <main className="workspace workspace-list">
        <section className="workspace-main list-main">
          <section className="editor-section editor-section-flat">
            <div className="section-head section-head-tight">
              <div>
                <p className="eyebrow">Serverless</p>
                <h2>Functions</h2>
                <p className="muted section-support">
                  코드를 API로 실행하고, 필요한 데이터베이스를 연결합니다.
                </p>
              </div>
            </div>
            {error && (
              <p className="function-error" role="alert">
                {error}
              </p>
            )}
            <section
              id="function-databases"
              className="function-panel function-databases"
              aria-label="Databases"
            >
              <div className="function-detail-head">
                <div>
                  <h3>
                    Databases <span className="muted">{databases.length}/10</span>
                  </h3>
                  <p className="muted">SQLite 데이터베이스를 만들고 함수에 연결하세요.</p>
                </div>
              </div>
              <form
                className="function-database-create"
                onSubmit={(event) => {
                  event.preventDefault();
                  void run(async () => {
                    const created = await createDatabase(databaseName);
                    await refreshDatabases();
                    setSelectedDatabase(created.id);
                    setBindingDatabase(created.id);
                    setDatabaseName('');
                  });
                }}
              >
                <label htmlFor="database-name">Name</label>
                <input
                  id="database-name"
                  required
                  pattern="[a-z][a-z0-9-]{0,62}"
                  placeholder="my-app-db"
                  value={databaseName}
                  onChange={(event) => setDatabaseName(event.target.value)}
                />
                <button className="primary-button" type="submit" disabled={busy}>
                  Create database
                </button>
              </form>
              {databases.length > 0 && (
                <details className="function-disclosure function-database-editor">
                  <summary>SQL editor · {selectedDatabaseItem?.name}</summary>
                  {import.meta.env.DEV && !rcpConfig.apiBaseUrl && (
                    <p className="muted function-demo-note">
                      로컬 모의 콘솔에서는 SQL이 실제로 저장되거나 실행되지 않습니다.
                    </p>
                  )}
                  <div className={`function-database-workspace ${sqlResult ? 'has-result' : ''}`}>
                    <div className="function-form">
                      <label htmlFor="database-select">Database</label>
                      <select
                        id="database-select"
                        value={selectedDatabase}
                        onChange={(event) => {
                          setSelectedDatabase(event.target.value);
                          setSQLResult(null);
                        }}
                      >
                        {databases.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                      <label htmlFor="database-sql">SQL</label>
                      <textarea
                        id="database-sql"
                        rows={5}
                        value={sql}
                        onChange={(event) => setSQL(event.target.value)}
                        spellCheck={false}
                      />
                      <label htmlFor="database-params">Parameters (JSON array)</label>
                      <input
                        id="database-params"
                        value={sqlParams}
                        onChange={(event) => setSQLParams(event.target.value)}
                        spellCheck={false}
                      />
                      <div className="function-data-actions">
                        <button
                          className="primary-button"
                          type="button"
                          disabled={busy || !selectedDatabase}
                          onClick={() =>
                            void run(async () => {
                              const parsed: unknown = JSON.parse(sqlParams);
                              if (!Array.isArray(parsed))
                                throw new Error('Parameters는 JSON 배열이어야 합니다.');
                              setSQLResult(null);
                              setSQLResult(await queryDatabase(selectedDatabase, sql, parsed));
                            })
                          }
                        >
                          Run query
                        </button>
                        <button
                          className="danger-button"
                          type="button"
                          disabled={busy || !selectedDatabase}
                          onClick={() => {
                            if (
                              !window.confirm(
                                `'${selectedDatabaseItem?.name}' 데이터베이스와 모든 데이터를 영구 삭제할까요?`,
                              )
                            )
                              return;
                            void run(async () => {
                              await deleteDatabase(selectedDatabase);
                              setSQLResult(null);
                              await Promise.all([refreshDatabases(), refreshBindings()]);
                            });
                          }}
                        >
                          Delete database
                        </button>
                      </div>
                    </div>
                    {sqlResult && (
                      <div className="function-database-results" aria-live="polite">
                        <h4>Result</h4>
                        <p className="muted">
                          {sqlResult.columns.length > 0
                            ? `${sqlResult.rows.length} rows returned`
                            : `Query completed · ${sqlResult.rows_affected} rows affected`}
                        </p>
                        {sqlResult.columns.length > 0 && (
                          <div className="function-table-scroll">
                            <table>
                              <thead>
                                <tr>
                                  {sqlResult.columns.map((column) => (
                                    <th key={column}>{column}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {sqlResult.rows.map((row) => (
                                  <tr key={JSON.stringify(row)}>
                                    {sqlResult.columns.map((column) => (
                                      <td key={column}>
                                        {row[column] == null ? 'NULL' : String(row[column])}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </details>
              )}
            </section>
            <div className="function-grid">
              <section className="function-panel" aria-label="Deploy function">
                <h3>Deploy</h3>
                <p className="muted">
                  Rust·Go·JavaScript·Python 소스는 WASM으로 빌드합니다. WASI 모듈도 직접 올릴 수
                  있습니다. 소스는 256 KB, 모듈은 32 MB까지 등록합니다.
                </p>
                <form
                  className="function-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!file) return;
                    const form = event.currentTarget;
                    void run(async () => {
                      const created = await createFunction(name, language, file, dataMode);
                      await refresh();
                      setSelected(created.id);
                      setIssuedKey(null);
                      setName('');
                      setFile(null);
                      setDataMode(false);
                      form.reset();
                    });
                  }}
                >
                  <label htmlFor="function-name">Name</label>
                  <input
                    id="function-name"
                    required
                    pattern="[a-z][a-z0-9-]{0,62}"
                    placeholder="hello-world"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                  <label htmlFor="function-language">Language</label>
                  <select
                    id="function-language"
                    value={language}
                    onChange={(event) => {
                      setLanguage(event.target.value as FunctionLanguage);
                      setFile(null);
                    }}
                  >
                    <option value="rust">Rust</option>
                    <option value="go">Go</option>
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="wasm">WASM</option>
                  </select>
                  <label htmlFor="function-file">
                    {language === 'wasm' ? 'Module file' : 'Source file'}
                  </label>
                  <input
                    key={language}
                    id="function-file"
                    type="file"
                    required
                    accept={
                      { rust: '.rs', go: '.go', javascript: '.js', python: '.py', wasm: '.wasm' }[
                        language
                      ]
                    }
                    onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  />
                  <label className="function-checkbox" htmlFor="function-data-mode">
                    <input
                      id="function-data-mode"
                      type="checkbox"
                      checked={dataMode}
                      onChange={(event) => setDataMode(event.target.checked)}
                    />
                    Enable data access
                  </label>
                  <p className="muted function-field-hint">데이터베이스를 연결하려면 켜세요.</p>
                  <button className="primary-button" type="submit" disabled={busy || !file}>
                    Deploy
                  </button>
                </form>
              </section>
              <section className="function-panel" aria-label="Function list">
                <h3>
                  Functions <span className="muted">{items.length}/20</span>
                </h3>
                {loading ? (
                  <p className="muted">불러오는 중…</p>
                ) : items.length === 0 ? (
                  <p className="muted">등록된 함수가 없습니다.</p>
                ) : (
                  <ul className="function-list">
                    {items.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          className={`function-list-item ${selected === item.id ? 'active' : ''}`}
                          onClick={() => {
                            setSelected(item.id);
                            setIssuedKey(null);
                            setCurlCopied(false);
                            setResult(null);
                            setReplacement(null);
                            setReplacementLanguage(item.language ?? 'wasm');
                            setReplacementDataMode(item.data_mode ?? false);
                          }}
                        >
                          <strong>{item.name}</strong>
                          <small>
                            {item.key_enabled &&
                            (!item.key_expires_at || new Date(item.key_expires_at) > new Date())
                              ? 'API key active'
                              : 'API key needed'}
                            {' · '}
                            {item.data_mode ? 'Data access on' : 'Data access off'}
                          </small>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
            {active && (
              <section className="function-panel function-detail" aria-label="Invoke function">
                <div className="function-detail-head">
                  <div>
                    <p className="eyebrow">Selected function</p>
                    <h3>{active.name}</h3>
                  </div>
                  <button
                    type="button"
                    className="danger-button"
                    disabled={busy}
                    onClick={() => {
                      if (!window.confirm(`'${active.name}' 함수를 삭제할까요?`)) return;
                      void run(async () => {
                        await deleteFunction(active.id);
                        await refresh();
                        setResult(null);
                        setIssuedKey(null);
                      });
                    }}
                  >
                    Delete
                  </button>
                </div>
                <div className="function-access">
                  <h4>HTTP endpoint</h4>
                  <p className="muted">
                    이 URL은 외부에서 호출할 수 있습니다. 요청에는 함수 전용 Bearer 키가 필요합니다.
                  </p>
                  <input aria-label="HTTP endpoint" readOnly value={endpoint} />
                  {!active.key_enabled && (
                    <p className="muted">외부에서 호출하려면 아래에서 API 키를 발급하세요.</p>
                  )}
                  {import.meta.env.DEV && !rcpConfig.apiBaseUrl && (
                    <p className="muted">
                      로컬 모의 콘솔에서는 이 URL이 외부 요청을 받지 않습니다.
                    </p>
                  )}
                  <div className="function-key-controls">
                    <label htmlFor="function-key-days">Key expiry</label>
                    <select
                      id="function-key-days"
                      value={keyDays}
                      onChange={(event) => setKeyDays(Number(event.target.value))}
                    >
                      <option value={1}>1 day</option>
                      <option value={7}>7 days</option>
                      <option value={30}>30 days</option>
                      <option value={90}>90 days</option>
                    </select>
                    <button
                      className="ghost-button"
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        if (
                          active.key_enabled &&
                          !window.confirm(
                            '키를 교체하면 이전 키는 즉시 사용할 수 없습니다. 교체할까요?',
                          )
                        )
                          return;
                        void run(async () => {
                          const issued = await issueFunctionKey(active.id, keyDays);
                          setIssuedKey(issued.key);
                          await refresh();
                        });
                      }}
                    >
                      {active.key_enabled ? 'Rotate key' : 'Create key'}
                    </button>
                    {active.key_enabled && (
                      <button
                        className="danger-button"
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          if (
                            !window.confirm(
                              '키를 폐기하면 외부 호출이 즉시 중단됩니다. 폐기할까요?',
                            )
                          )
                            return;
                          void run(async () => {
                            await revokeFunctionKey(active.id);
                            setIssuedKey(null);
                            await refresh();
                          });
                        }}
                      >
                        Revoke key
                      </button>
                    )}
                  </div>
                  {active.key_enabled && active.key_expires_at && (
                    <p className="muted">
                      키 만료: {new Date(active.key_expires_at).toLocaleString('ko-KR')}
                    </p>
                  )}
                  {issuedKey && (
                    <div className="function-issued-key" role="status">
                      <label htmlFor="function-issued-key">New API key</label>
                      <input
                        id="function-issued-key"
                        readOnly
                        value={issuedKey}
                        onFocus={(event) => event.target.select()}
                      />
                      <p className="muted">
                        키 원문은 지금만 표시됩니다. 안전한 곳에 복사해 보관하세요.
                      </p>
                    </div>
                  )}
                  <div className="function-curl">
                    <div className="function-detail-head">
                      <div>
                        <h4>curl example</h4>
                        <p className="muted">
                          발급한 키를 <code>FUNCTION_KEY</code> 환경 변수에 넣고 실행하세요. 아래
                          요청 본문은 Input (JSON) 값과 함께 바뀝니다.
                        </p>
                      </div>
                      <button
                        className="ghost-button"
                        type="button"
                        onClick={() => {
                          void navigator.clipboard.writeText(curlExample).then(
                            () => setCurlCopied(true),
                            () => setError('curl 예시를 복사하지 못했습니다.'),
                          );
                        }}
                      >
                        {curlCopied ? 'Copied' : 'Copy curl'}
                      </button>
                    </div>
                    <pre>{curlExample}</pre>
                  </div>
                </div>
                <section className="function-data" aria-label="Database bindings">
                  <div className="function-detail-head">
                    <div>
                      <h4>Database bindings</h4>
                      <p className="muted">
                        함수 코드에서는 바인딩 이름으로 연결된 DB에 쿼리합니다.
                      </p>
                    </div>
                  </div>
                  {!active.data_mode ? (
                    <p className="muted">
                      DB를 연결하려면 Update function에서 파일을 다시 올리며 데이터 접근을 켜세요.
                    </p>
                  ) : databases.length === 0 ? (
                    <p className="muted">
                      먼저 <a href="#function-databases">데이터베이스를 만드세요</a>.
                    </p>
                  ) : (
                    <>
                      <form
                        className="function-database-create"
                        onSubmit={(event) => {
                          event.preventDefault();
                          if (!bindingDatabase) return;
                          void run(async () => {
                            await bindDatabase(active.id, bindingAlias, bindingDatabase);
                            await refreshBindings();
                          });
                        }}
                      >
                        <label htmlFor="binding-alias">Binding</label>
                        <input
                          id="binding-alias"
                          required
                          pattern="[A-Z][A-Z0-9_]{0,31}"
                          value={bindingAlias}
                          onChange={(event) => setBindingAlias(event.target.value.toUpperCase())}
                        />
                        <label htmlFor="binding-database">Database</label>
                        <select
                          id="binding-database"
                          value={bindingDatabase}
                          onChange={(event) => setBindingDatabase(event.target.value)}
                        >
                          {databases.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                        <button
                          className="ghost-button"
                          type="submit"
                          disabled={busy || !bindingDatabase}
                        >
                          Bind database
                        </button>
                      </form>
                      {bindings.length === 0 ? (
                        <p className="muted">연결된 DB가 없습니다.</p>
                      ) : (
                        <ul className="function-binding-list">
                          {bindings.map((binding) => (
                            <li key={binding.alias}>
                              <span>
                                <strong>{binding.alias}</strong> → {binding.database_name}
                              </span>
                              <button
                                className="danger-button"
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  void run(async () => {
                                    await unbindDatabase(active.id, binding.alias);
                                    await refreshBindings();
                                  })
                                }
                              >
                                Unbind
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      {bindings.length > 0 && (
                        <details className="function-disclosure function-code-example">
                          <summary>Code example</summary>
                          <p className="muted">
                            함수 코드에서 바인딩 이름을 사용해 SQL을 실행합니다.
                          </p>
                          <code>
                            {JSON.stringify({
                              $rcp: 'sql',
                              binding: bindings[0].alias,
                              sql: 'SELECT * FROM notes WHERE id = ?',
                              params: [1],
                            })}
                          </code>
                        </details>
                      )}
                    </>
                  )}
                </section>
                <div className="function-grid">
                  <div className="function-form">
                    <label htmlFor="function-input">Input (JSON)</label>
                    <textarea
                      id="function-input"
                      rows={6}
                      value={input}
                      onChange={(event) => {
                        setInput(event.target.value);
                        setCurlCopied(false);
                      }}
                      placeholder='{"message":"hello"}'
                    />
                    <button
                      className="primary-button"
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void run(async () => setResult(await invokeFunction(active.id, input)))
                      }
                    >
                      Invoke
                    </button>
                  </div>
                  <details className="function-disclosure function-update">
                    <summary>Update function</summary>
                    <div className="function-form">
                      <label htmlFor="function-replace-language">Replacement language</label>
                      <select
                        id="function-replace-language"
                        value={replacementLanguage}
                        onChange={(event) => {
                          setReplacementLanguage(event.target.value as FunctionLanguage);
                          setReplacement(null);
                        }}
                      >
                        <option value="rust">Rust</option>
                        <option value="go">Go</option>
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="wasm">WASM</option>
                      </select>
                      <label htmlFor="function-replace">Replace file</label>
                      <input
                        key={replacementLanguage}
                        id="function-replace"
                        type="file"
                        accept={
                          {
                            rust: '.rs',
                            go: '.go',
                            javascript: '.js',
                            python: '.py',
                            wasm: '.wasm',
                          }[replacementLanguage]
                        }
                        onChange={(event) => setReplacement(event.target.files?.[0] ?? null)}
                      />
                      <label className="function-checkbox" htmlFor="function-replace-data-mode">
                        <input
                          id="function-replace-data-mode"
                          type="checkbox"
                          checked={replacementDataMode}
                          onChange={(event) => setReplacementDataMode(event.target.checked)}
                        />
                        Enable data access
                      </label>
                      <button
                        className="ghost-button"
                        type="button"
                        disabled={busy || !replacement}
                        onClick={() => {
                          if (!replacement) return;
                          void run(async () => {
                            await updateFunction(
                              active.id,
                              replacementLanguage,
                              replacement,
                              replacementDataMode,
                            );
                            await refresh();
                            setReplacement(null);
                          });
                        }}
                      >
                        Update
                      </button>
                    </div>
                  </details>
                </div>
                {active.data_mode && (
                  <details
                    className="function-disclosure function-data"
                    aria-label="Key-value data"
                  >
                    <summary>Key-value data</summary>
                    <div className="function-disclosure-content">
                      <div className="function-detail-head">
                        <div>
                          <p className="muted">이 함수만 사용하는 JSON 값을 관리합니다.</p>
                        </div>
                        <button
                          className="ghost-button"
                          type="button"
                          disabled={busy}
                          onClick={() => void run(refreshData)}
                        >
                          Refresh
                        </button>
                      </div>
                      <div className="function-grid">
                        <div className="function-form">
                          <label htmlFor="function-data-collection">Collection</label>
                          <input
                            id="function-data-collection"
                            value={dataCollection}
                            onChange={(event) => setDataCollection(event.target.value)}
                            placeholder="default"
                          />
                          <label htmlFor="function-data-key">Key</label>
                          <input
                            id="function-data-key"
                            value={dataKey}
                            onChange={(event) => setDataKey(event.target.value)}
                            placeholder="item-1"
                          />
                          <label htmlFor="function-data-value">Value (JSON)</label>
                          <textarea
                            id="function-data-value"
                            rows={5}
                            value={dataValue}
                            onChange={(event) => setDataValue(event.target.value)}
                          />
                          <div className="function-data-actions">
                            <button
                              className="primary-button"
                              type="button"
                              disabled={busy || !dataKey}
                              onClick={() =>
                                void run(async () => {
                                  const value: unknown = JSON.parse(dataValue);
                                  await putFunctionData(active.id, dataCollection, dataKey, value);
                                  await refreshData();
                                })
                              }
                            >
                              Save
                            </button>
                            <button
                              className="ghost-button"
                              type="button"
                              disabled={busy || !dataKey}
                              onClick={() =>
                                void run(async () => {
                                  const item = await getFunctionData(
                                    active.id,
                                    dataCollection,
                                    dataKey,
                                  );
                                  setDataValue(JSON.stringify(item.value, null, 2));
                                })
                              }
                            >
                              Load
                            </button>
                            <button
                              className="danger-button"
                              type="button"
                              disabled={busy || !dataKey}
                              onClick={() =>
                                void run(async () => {
                                  if (!window.confirm(`'${dataKey}' 값을 삭제할까요?`)) return;
                                  await deleteFunctionData(active.id, dataCollection, dataKey);
                                  await refreshData();
                                })
                              }
                            >
                              Delete value
                            </button>
                          </div>
                        </div>
                        <div className="function-data-list">
                          {dataItems.length === 0 ? (
                            <p className="muted">이 컬렉션에 저장된 값이 없습니다.</p>
                          ) : (
                            dataItems.map((item) => (
                              <button
                                key={item.key}
                                type="button"
                                onClick={() => {
                                  setDataKey(item.key);
                                  setDataValue(JSON.stringify(item.value, null, 2));
                                }}
                              >
                                <strong>{item.key}</strong>
                                <small>{new Date(item.updated_at).toLocaleString('ko-KR')}</small>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </details>
                )}
                {result && (
                  <div className="function-result" aria-live="polite">
                    <h4>Response</h4>
                    <pre>{result.stdout || '(empty)'}</pre>
                    {result.stderr && (
                      <>
                        <h4>Logs</h4>
                        <pre>{result.stderr}</pre>
                      </>
                    )}
                    {result.exit_code !== 0 && <p>Exit code: {result.exit_code}</p>}
                  </div>
                )}
              </section>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}
