'use client';
import { useState, useEffect } from 'react';
import ModalBase from '../ModalBase';
import ExercicioSelector from '../../ExercicioSelector';
import baseStyles from '../index.module.css';

export default function ModalUniversal({
    isOpen,
    onClose,
    mode = 'view', // 'view', 'form', 'confirm'
    title = "Modal",

    // Para modo 'view'
    data = {},
    fields = [],

    // Para modo 'form'
    formFields = [],
    initialFormData = {},
    onSubmit,
    submitText = "Salvar",
    validationRules = {},

    // Para modo 'confirm'
    message = "",
    confirmText = "Confirmar",
    onConfirm,
    confirmType = "default", // 'default', 'danger', 'warning'

    // Comum a todos
    actions = [],
    cancelText = "Cancelar",
    isLoading = false,
    error = '',
    success = '',
    size = 'default',
    showCloseButton = true,
    customContent = null,
    footerActions = []
}) {
    const [formData, setFormData] = useState(initialFormData);
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setFormData(initialFormData);
            setFormErrors({});
        }
    }, [isOpen]);

    // Validação de formulário
    const validateForm = () => {
        const errors = {};

        formFields.forEach(field => {
            const value = formData[field.key];

            // Campo obrigatório - validação específica para tipos especiais
            if (field.required) {
                if (field.type === 'multiselect') {
                    if (!value || !Array.isArray(value) || value.length === 0) {
                        errors[field.key] = `${field.label} é obrigatório`;
                    }
                } else if (field.type === 'exercicios') {
                    if (!value || !Array.isArray(value) || value.length === 0) {
                        errors[field.key] = `${field.label} é obrigatório`;
                    }
                } else if (field.type === 'alternativas') {
                    if (!value || !Array.isArray(value) || value.length === 0) {
                        errors[field.key] = `${field.label} é obrigatório`;
                    } else {
                        // Verificar se todas as alternativas têm descrição
                        const alternativasVazias = value.some(alt => !alt.descricao || alt.descricao.trim() === '');
                        if (alternativasVazias) {
                            errors[field.key] = 'Todas as alternativas devem ter descrição';
                        }
                        // Verificar se pelo menos uma está marcada como correta
                        const temCorreta = value.some(alt => alt.correta);
                        if (!temCorreta) {
                            errors[field.key] = 'Marque pelo menos uma alternativa como correta';
                        }
                    }
                } else if (!value || (typeof value === 'string' && value.trim() === '')) {
                    errors[field.key] = `${field.label} é obrigatório`;
                }
            }

            // Validações personalizadas
            if (validationRules[field.key] && value) {
                const customError = validationRules[field.key](value, formData);
                if (customError) {
                    errors[field.key] = customError;
                }
            }

            // Validações por tipo
            if (value && field.type === 'email' && !/\S+@\S+\.\S+/.test(value)) {
                errors[field.key] = 'Email inválido';
            }

            if (value && field.type === 'number') {
                const num = parseFloat(value);
                if (isNaN(num)) {
                    errors[field.key] = 'Deve ser um número válido';
                } else if (field.min !== undefined && num < field.min) {
                    errors[field.key] = `Valor mínimo: ${field.min}`;
                } else if (field.max !== undefined && num > field.max) {
                    errors[field.key] = `Valor máximo: ${field.max}`;
                }
            }
        });

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handlers
    const handleInputChange = (fieldKey, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldKey]: value
        }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (onSubmit) {
            onSubmit(formData);
        }
    };

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        }
        onClose();
    };

    // Renderizadores
    const renderField = (field) => {
        const value = formData[field.key] || '';
        const hasError = formErrors[field.key];

        const commonProps = {
            id: field.key,
            name: field.key,
            value: value,
            onChange: (e) => handleInputChange(field.key, e.target.value),
            required: field.required,
            disabled: isLoading || field.disabled,
            placeholder: field.placeholder,
            className: hasError ? baseStyles.inputError : ''
        };

        let fieldElement;

        switch (field.type) {
            case 'textarea':
                fieldElement = <textarea {...commonProps} rows={field.rows || 3} />;
                break;
            case 'select':
                fieldElement = (
                    <select {...commonProps}>
                        <option value="">{field.placeholder || 'Selecione...'}</option>
                        {field.options?.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );
                break;
            case 'multiselect':
                fieldElement = (
                    <select
                        {...commonProps}
                        multiple
                        style={{ minHeight: '120px' }}
                        value={formData[field.key] || []}
                        onChange={(e) => {
                            const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
                            handleInputChange(field.key, selectedValues);
                        }}
                    >
                        {field.options?.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );
                break;
            case 'alternativas':
                const alternativas = formData[field.key] || [{ descricao: '', correta: false }];
                fieldElement = (
                    <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '6px' }}>
                        <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
                            Alternativas (marque a(s) correta(s)):
                        </div>
                        {alternativas.map((alt, index) => (
                            <div key={index} style={{ marginBottom: '10px', padding: '8px', border: '1px solid #eee', borderRadius: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                                    <input
                                        type="checkbox"
                                        checked={alt.correta || false}
                                        onChange={(e) => {
                                            const newAlternativas = [...alternativas];
                                            newAlternativas[index] = { ...newAlternativas[index], correta: e.target.checked };
                                            handleInputChange(field.key, newAlternativas);
                                        }}
                                        style={{ marginRight: '8px' }}
                                    />
                                    <label style={{ fontWeight: alt.correta ? 'bold' : 'normal', color: alt.correta ? '#28a745' : 'inherit' }}>
                                        Alternativa {index + 1} {alt.correta ? '(Correta)' : ''}
                                    </label>
                                </div>
                                <input
                                    type="text"
                                    value={alt.descricao || ''}
                                    onChange={(e) => {
                                        const newAlternativas = [...alternativas];
                                        newAlternativas[index] = { ...newAlternativas[index], descricao: e.target.value };
                                        handleInputChange(field.key, newAlternativas);
                                    }}
                                    placeholder={`Digite o texto da alternativa ${index + 1}`}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px'
                                    }}
                                />
                                {alternativas.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newAlternativas = alternativas.filter((_, i) => i !== index);
                                            handleInputChange(field.key, newAlternativas);
                                        }}
                                        style={{
                                            marginTop: '5px',
                                            padding: '4px 8px',
                                            backgroundColor: '#dc3545',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '12px'
                                        }}
                                    >
                                        Remover
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => {
                                const newAlternativas = [...alternativas, { descricao: '', correta: false }];
                                handleInputChange(field.key, newAlternativas);
                            }}
                            style={{
                                padding: '8px 12px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            + Adicionar Alternativa
                        </button>
                    </div>
                );
                break;
            case 'number':
                fieldElement = (
                    <input
                        {...commonProps}
                        type="number"
                        min={field.min}
                        max={field.max}
                        step={field.step}
                    />
                );
                break;
            case 'file':
                fieldElement = (
                    <input
                        {...commonProps}
                        type="file"
                        accept={field.accept}
                        onChange={(e) => handleInputChange(field.key, e.target.files[0])}
                    />
                );
                break;
            case 'image':
                // Função para comprimir imagem
                const compressImage = (file, maxSizeKB = 20) => {
                    return new Promise((resolve) => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        const img = new Image();

                        img.onload = () => {
                            // Redimensionar para máximo 150x150 pixels (muito pequeno)
                            const maxDimension = 150;
                            let { width, height } = img;

                            if (width > height) {
                                if (width > maxDimension) {
                                    height = (height * maxDimension) / width;
                                    width = maxDimension;
                                }
                            } else {
                                if (height > maxDimension) {
                                    width = (width * maxDimension) / height;
                                    height = maxDimension;
                                }
                            }

                            canvas.width = width;
                            canvas.height = height;

                            // Desenhar e comprimir
                            ctx.drawImage(img, 0, 0, width, height);

                            // Comprimir muito para caber em VARCHAR(100)
                            let quality = 0.3; // Baixa qualidade
                            let compressed = canvas.toDataURL('image/jpeg', quality);

                            // Se ainda for muito grande, usar apenas o nome do arquivo
                            if (compressed.length > 80) { // Margem de segurança para VARCHAR(100)
                                resolve(file.name);
                            } else {
                                resolve(compressed);
                            }
                        };

                        img.src = URL.createObjectURL(file);
                    });
                };

                fieldElement = (
                    <div className={baseStyles.imageField}>
                        <input
                            id={field.key}
                            name={field.key}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            disabled={isLoading || field.disabled}
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file || !file.type.startsWith('image/')) {
                                    return;
                                }

                                try {
                                    // Tentar comprimir, se não conseguir, usar nome do arquivo
                                    const result = await compressImage(file, 15); // Máximo 15KB
                                    handleInputChange(field.key, result);
                                } catch (error) {
                                    console.error('Erro ao processar imagem:', error);
                                    // Fallback: usar apenas o nome do arquivo
                                    handleInputChange(field.key, file.name);
                                }

                                // Limpa o input
                                e.target.value = '';
                            }}
                        />
                        <label
                            htmlFor={field.key}
                            className={baseStyles.imageInputLabel}
                        >
                            {value ? (
                                <div className={baseStyles.imagePreview}>
                                    {value.startsWith('data:') ? (
                                        <img
                                            src={value}
                                            alt="Preview"
                                            className={baseStyles.previewImage}
                                        />
                                    ) : (
                                        <div className={baseStyles.fileName}>
                                            <i className="fa-solid fa-file-image"></i>
                                            <span>{value}</span>
                                        </div>
                                    )}
                                    <div className={baseStyles.imageOverlay}>
                                        <i className="fa-solid fa-camera"></i>
                                        <span>Alterar imagem</span>
                                    </div>
                                </div>
                            ) : (
                                <div className={baseStyles.imagePlaceholder}>
                                    <i className="fa-solid fa-image"></i>
                                    <span>Clique para selecionar uma imagem</span>
                                    <small style={{ marginTop: '8px', fontSize: '12px', color: '#6c757d' }}>
                                        Imagens grandes serão salvas apenas pelo nome
                                    </small>
                                </div>
                            )}
                        </label>
                        {value && (
                            <button
                                type="button"
                                className={baseStyles.removeImageButton}
                                onClick={() => handleInputChange(field.key, '')}
                            >
                                <i className="fa-solid fa-trash"></i>
                                Remover imagem
                            </button>
                        )}
                        {value && (
                            <div className={baseStyles.imageSizeInfo}>
                                <small>
                                    {value.startsWith('data:')
                                        ? `Miniatura: ${Math.round(value.length / 1024)}KB`
                                        : `Arquivo: ${value}`}
                                </small>
                            </div>
                        )}
                    </div>
                );
                break;
            case 'checkbox':
                fieldElement = (
                    <label className={baseStyles.checkboxLabel}>
                        <input
                            {...commonProps}
                            type="checkbox"
                            checked={value}
                            onChange={(e) => handleInputChange(field.key, e.target.checked)}
                        />
                        {field.checkboxLabel || field.label}
                    </label>
                );
                break;
            case 'radio':
                fieldElement = (
                    <div className={baseStyles.radioGroup}>
                        {field.options?.map(option => (
                            <label key={option.value} className={baseStyles.radioLabel}>
                                <input
                                    type="radio"
                                    name={field.key}
                                    value={option.value}
                                    checked={value === option.value}
                                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                                    disabled={isLoading || field.disabled}
                                />
                                {option.label}
                            </label>
                        ))}
                    </div>
                );
                break;
            case 'date':
                fieldElement = <input {...commonProps} type="date" />;
                break;
            case 'email':
                fieldElement = <input {...commonProps} type="email" />;
                break;
            case 'password':
                fieldElement = <input {...commonProps} type="password" />;
                break;
            case 'exercicios':
                fieldElement = (
                    <ExercicioSelector
                        exerciciosDisponiveis={field.exerciciosDisponiveis || []}
                        exerciciosSelecionados={formData[field.key] || []}
                        onChange={(selectedIds) => handleInputChange(field.key, selectedIds)}
                        placeholder={field.placeholder}
                        disabled={isLoading || field.disabled}
                        className={hasError ? baseStyles.inputError : ''}
                    />
                );
                break;
            case 'hidden':
                fieldElement = <input {...commonProps} type="hidden" />;
                return fieldElement; // Return early, no label needed
            default:
                fieldElement = <input {...commonProps} type={field.type || 'text'} />;
        }

        return (
            <div key={field.key} className={baseStyles.formGroup}>
                {field.type !== 'checkbox' && field.type !== 'hidden' && (
                    <label htmlFor={field.key}>
                        {field.label}
                        {field.required && <span style={{ color: '#dc3545' }}>*</span>}
                    </label>
                )}
                {fieldElement}
                {hasError && (
                    <div className={baseStyles.fieldError}>
                        {formErrors[field.key]}
                    </div>
                )}
                {field.help && (
                    <small className={baseStyles.fieldHelp}>
                        {field.help}
                    </small>
                )}
            </div>
        );
    };

    const renderViewMode = () => (
        <>
            {fields.map((field) => (
                <div key={field.key} className={baseStyles.formGroup}>
                    <label>{field.label}</label>
                    <div className={baseStyles.infoValue}>
                        {field.render
                            ? field.render(data[field.key], data)
                            : data[field.key] || '-'
                        }
                    </div>
                </div>
            ))}

            <div className={baseStyles.buttonGroup}>
                {actions.map((action, index) => (
                    <button
                        key={index}
                        className={`${baseStyles.btns} ${action.className || baseStyles.voltar}`}
                        onClick={action.onClick}
                    >
                        {action.icon && <i className={`fa-solid ${action.icon}`}></i>}
                        {action.label}
                    </button>
                ))}

                <button
                    className={`${baseStyles.btns} ${baseStyles.voltar}`}
                    onClick={onClose}
                >
                    {cancelText}
                </button>
            </div>
        </>
    );

    const renderFormMode = () => (
        <>
            <form onSubmit={handleFormSubmit}>
                {formFields.map((field) => renderField(field))}

                <div className={baseStyles.buttonGroup}>
                    <button
                        type="button"
                        className={`${baseStyles.btns} ${baseStyles.cancelar}`}
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="submit"
                        className={`${baseStyles.btns} ${baseStyles.salvar}`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Salvando...' : submitText}
                    </button>
                </div>
            </form>
        </>
    );

    const renderConfirmMode = () => (
        <>
            <div className={baseStyles.formGroup}>
                <p>{message}</p>
            </div>

            <div className={baseStyles.buttonGroup}>
                <button
                    className={`${baseStyles.btns} ${baseStyles.cancelar}`}
                    onClick={onClose}
                >
                    {cancelText}
                </button>
                <button
                    className={`${baseStyles.btns} ${confirmType === 'danger' ? baseStyles.excluir :
                        confirmType === 'warning' ? baseStyles.warning :
                            baseStyles.salvar
                        }`}
                    onClick={handleConfirm}
                >
                    {confirmText}
                </button>
            </div>
        </>
    );

    const getModalSize = () => {
        if (size !== 'default') return size;
        if (mode === 'form' && formFields.length > 6) return 'large';
        if (mode === 'confirm') return 'small';
        return 'default';
    };

    return (
        <ModalBase
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size={getModalSize()}
            showCloseButton={showCloseButton}
        >
            {error && (
                <div className={baseStyles.errorMessage}>
                    {error}
                </div>
            )}

            {success && (
                <div className={baseStyles.successMessage}>
                    {success}
                </div>
            )}

            {customContent || (
                <>
                    {mode === 'view' && renderViewMode()}
                    {mode === 'form' && renderFormMode()}
                    {mode === 'confirm' && renderConfirmMode()}
                </>
            )}

            {footerActions.length > 0 && (
                <div className={baseStyles.buttonGroup}>
                    {footerActions.map((action, index) => (
                        <button
                            key={index}
                            className={`${baseStyles.btns} ${action.className || baseStyles.voltar}`}
                            onClick={action.onClick}
                            disabled={isLoading || action.disabled}
                        >
                            {action.icon && <i className={`fa-solid ${action.icon}`}></i>}
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </ModalBase>
    );
}
