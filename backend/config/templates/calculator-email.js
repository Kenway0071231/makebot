/**
 * Шаблон письма для заявок с калькулятора
 */

module.exports = function(data) {
    const calculation = data.calculation;
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #4361ee, #7209b7); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .section { margin-bottom: 25px; }
        .section-title { color: #4361ee; font-weight: bold; font-size: 18px; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #eef2ff; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .info-item { margin-bottom: 12px; }
        .info-label { font-weight: bold; color: #666; font-size: 14px; }
        .calculation-box { background: white; padding: 20px; border-radius: 8px; border: 2px solid #eef2ff; margin: 20px 0; }
        .price { font-size: 32px; font-weight: bold; color: #4361ee; text-align: center; margin: 20px 0; }
        .timeline { background: #eef2ff; padding: 15px; border-radius: 8px; }
        .timeline-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #d1d9ff; }
        .timeline-item:last-child { border-bottom: none; }
        .comment { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ffc107; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Новая заявка с калькулятора</h1>
        <p>ID: #${data.id} | ${new Date(data.timestamp).toLocaleString('ru-RU')}</p>
    </div>
    
    <div class="content">
        <!-- Контактная информация -->
        <div class="section">
            <div class="section-title">👤 Контактная информация</div>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Имя:</div>
                    <div>${data.name}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Телефон:</div>
                    <div>${data.phone}</div>
                </div>
                ${data.email ? `
                <div class="info-item">
                    <div class="info-label">Email:</div>
                    <div>${data.email}</div>
                </div>
                ` : ''}
                <div class="info-item">
                    <div class="info-label">IP:</div>
                    <div>${data.ip}</div>
                </div>
            </div>
        </div>
        
        <!-- Комментарий -->
        ${data.comment ? `
        <div class="section">
            <div class="section-title">💬 Комментарий клиента</div>
            <div class="comment">
                ${data.comment}
            </div>
        </div>
        ` : ''}
        
        <!-- Расчет -->
        <div class="section">
            <div class="section-title">📊 Расчет стоимости</div>
            <div class="calculation-box">
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Тип проекта:</div>
                        <div>${calculation.projectType}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Платформы:</div>
                        <div>${calculation.platforms}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Интеграции:</div>
                        <div>${calculation.integrations}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Сложность:</div>
                        <div>${calculation.complexity}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Срочность:</div>
                        <div>${calculation.deadline}</div>
                    </div>
                </div>
                
                <div class="price">
                    ${calculation.totalPrice.toLocaleString('ru-RU')} ₽
                </div>
                
                <div style="text-align: center; color: #666; margin-bottom: 20px;">
                    Диапазон: ${calculation.minPrice.toLocaleString('ru-RU')} – ${calculation.maxPrice.toLocaleString('ru-RU')} ₽
                </div>
                
                <div class="timeline">
                    <div class="section-title" style="font-size: 16px; margin-top: 0;">📅 Сроки разработки</div>
                    <div class="timeline-item">
                        <span>Проектирование:</span>
                        <strong>${calculation.timeline.planning}</strong>
                    </div>
                    <div class="timeline-item">
                        <span>Разработка:</span>
                        <strong>${calculation.timeline.development}</strong>
                    </div>
                    <div class="timeline-item">
                        <span>Тестирование:</span>
                        <strong>${calculation.timeline.testing}</strong>
                    </div>
                    <div class="timeline-item" style="border-top: 2px solid #4361ee; padding-top: 15px; margin-top: 10px; font-weight: bold;">
                        <span>Общий срок:</span>
                        <span style="color: #4361ee;">${calculation.timeline.total}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Футер -->
        <div class="footer">
            <p>📧 Это автоматическое письмо с сайта MakeBot</p>
            <p>🕐 ${new Date(data.timestamp).toLocaleString('ru-RU')}</p>
            <p>📍 IP: ${data.ip}</p>
        </div>
    </div>
</body>
</html>
    `;
};
