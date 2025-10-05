class HyperbolaConstructor {
    constructor() {
        this.canvas = document.getElementById('drawingCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scale = 2; // 2 pixels per mm
        
        // Construction parameters (in mm)
        this.directrixX = 50; // Position on canvas
        this.vertexDistance = 15;
        this.focusDistance = 40;
        this.eccentricity = 5/3;
        
        // Calculate positions (in pixels)
        this.directrix = this.directrixX * this.scale;
        this.vertex = (this.directrixX + this.vertexDistance) * this.scale;
        this.focus = (this.directrixX + this.focusDistance) * this.scale;
        this.axisY = this.canvas.height / 2;
        
        // State management
        this.currentStep = 0;
        this.completedSteps = [];
        this.constructionPoints = [];
        this.hyperbolaPoints = [];
        
        // Interactive controls
        this.currentDistance = 50;
        
        this.initializeEventListeners();
        this.initializeCanvas();
    }
    
    initializeCanvas() {
        this.ctx.fillStyle = '#fafafa';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.lineWidth = 0.5;
        
        // Vertical grid lines (every 10mm = 20px)
        for (let x = 0; x <= this.canvas.width; x += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal grid lines
        for (let y = 0; y <= this.canvas.height; y += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    initializeEventListeners() {
        // Step buttons
        document.getElementById('step1').addEventListener('click', () => this.executeStep(1));
        document.getElementById('step2').addEventListener('click', () => this.executeStep(2));
        document.getElementById('step3').addEventListener('click', () => this.executeStep(3));
        document.getElementById('step4').addEventListener('click', () => this.executeStep(4));
        document.getElementById('step5').addEventListener('click', () => this.executeStep(5));
        document.getElementById('step6').addEventListener('click', () => this.executeStep(6));
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        
        // Interactive slider
        const slider = document.getElementById('pointDistance');
        slider.addEventListener('input', (e) => {
            this.currentDistance = parseInt(e.target.value);
            this.updateCalculations();
            if (this.currentStep >= 4) {
                this.highlightConstructionPoint();
            }
        });
    }
    
    executeStep(step) {
        if (step <= this.currentStep + 1) {
            this.currentStep = step;
            this.completedSteps.push(step);
            
            // Update button states
            this.updateButtonStates();
            
            // Execute the step
            switch(step) {
                case 1: this.drawDirectrixAndAxis(); break;
                case 2: this.drawVertexAndFocus(); break;
                case 3: this.calculateEccentricity(); break;
                case 4: this.addConstructionPoints(); break;
                case 5: this.drawHyperbola(); break;
                case 6: this.showTangentAndNormal(); break;
            }
            
            // Update info panel
            this.updateStepInfo(step);
        }
    }
    
    updateButtonStates() {
        for (let i = 1; i <= 6; i++) {
            const btn = document.getElementById(`step${i}`);
            if (i <= this.currentStep) {
                btn.disabled = false;
                btn.classList.remove('btn--primary');
                btn.classList.add('btn--secondary');
                if (i === this.currentStep) {
                    btn.classList.add('step-active');
                }
            } else if (i === this.currentStep + 1) {
                btn.disabled = false;
                btn.classList.add('btn--primary');
            } else {
                btn.disabled = true;
            }
        }
    }
    
    drawDirectrixAndAxis() {
        // Draw directrix (vertical red line)
        this.ctx.strokeStyle = '#c01f2f';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(this.directrix, 50);
        this.ctx.lineTo(this.directrix, this.canvas.height - 50);
        this.ctx.stroke();
        
        // Label directrix
        this.ctx.fillStyle = '#c01f2f';
        this.ctx.font = 'bold 14px var(--font-family-base)';
        this.ctx.fillText('D', this.directrix - 15, 40);
        this.ctx.fillText("D'", this.directrix - 15, this.canvas.height - 20);
        
        // Draw axis (horizontal black line)
        this.ctx.strokeStyle = '#1f2121';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(20, this.axisY);
        this.ctx.lineTo(this.canvas.width - 20, this.axisY);
        this.ctx.stroke();
        
        // Label axis
        this.ctx.fillStyle = '#1f2121';
        this.ctx.fillText('A', 5, this.axisY - 5);
        this.ctx.fillText("A'", this.canvas.width - 20, this.axisY - 5);
    }
    
    drawVertexAndFocus() {
        // Draw vertex V (blue dot)
        this.ctx.fillStyle = '#218d8d';
        this.ctx.beginPath();
        this.ctx.arc(this.vertex, this.axisY, 6, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Label vertex
        this.ctx.fillStyle = '#218d8d';
        this.ctx.font = 'bold 14px var(--font-family-base)';
        this.ctx.fillText('V', this.vertex - 5, this.axisY - 15);
        
        // Draw focus F (red dot)
        this.ctx.fillStyle = '#c01f2f';
        this.ctx.beginPath();
        this.ctx.arc(this.focus, this.axisY, 6, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Label focus
        this.ctx.fillText('F', this.focus - 5, this.axisY - 15);
        
        // Draw measurements
        this.drawMeasurement(this.directrix, this.vertex, this.axisY - 30, '15mm', '#218d8d');
        this.drawMeasurement(this.directrix, this.focus, this.axisY + 45, '40mm', '#c01f2f');
    }
    
    drawMeasurement(x1, x2, y, text, color) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1;
        
        // Horizontal line
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y);
        this.ctx.lineTo(x2, y);
        this.ctx.stroke();
        
        // Vertical ticks
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y - 3);
        this.ctx.lineTo(x1, y + 3);
        this.ctx.moveTo(x2, y - 3);
        this.ctx.lineTo(x2, y + 3);
        this.ctx.stroke();
        
        // Text
        this.ctx.fillStyle = color;
        this.ctx.font = '12px var(--font-family-base)';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, (x1 + x2) / 2, y - 8);
        this.ctx.textAlign = 'start';
    }
    
    calculateEccentricity() {
        // Add eccentricity callout box
        const boxX = 200;
        const boxY = 50;
        const boxWidth = 180;
        const boxHeight = 80;
        
        // Draw box
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        this.ctx.strokeStyle = '#218d8d';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
        
        // Add text
        this.ctx.fillStyle = '#1f2121';
        this.ctx.font = 'bold 14px var(--font-family-base)';
        this.ctx.fillText('Eccentricity Calculation:', boxX + 10, boxY + 20);
        
        this.ctx.font = '12px var(--font-family-mono)';
        this.ctx.fillText('e = VF/VD', boxX + 10, boxY + 35);
        this.ctx.fillText('e = 25/15 = 5/3', boxX + 10, boxY + 50);
        this.ctx.fillText('e ≈ 1.667 > 1', boxX + 10, boxY + 65);
        
        this.ctx.fillStyle = '#c01f2f';
        this.ctx.fillText('∴ Hyperbola', boxX + 90, boxY + 65);
    }
    
    addConstructionPoints() {
        const distances = [20, 30, 50, 60, 80, 100];
        this.constructionPoints = [];
        
        distances.forEach((dist, index) => {
            const x = (this.directrixX + dist) * this.scale;
            const radius = this.eccentricity * dist * this.scale;
            
            // Draw vertical construction line
            this.ctx.strokeStyle = 'rgba(98, 108, 113, 0.6)';
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(x, 50);
            this.ctx.lineTo(x, this.canvas.height - 50);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
            
            // Calculate intersection points with focus-centered circle
            const dx = x - this.focus;
            const discriminant = radius * radius - dx * dx;
            
            if (discriminant >= 0) {
                const dy = Math.sqrt(discriminant);
                const y1 = this.axisY - dy;
                const y2 = this.axisY + dy;
                
                // Draw construction arcs (partial circles)
                this.ctx.strokeStyle = 'rgba(33, 128, 141, 0.4)';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(this.focus, this.axisY, radius, 0, 2 * Math.PI);
                this.ctx.stroke();
                
                // Mark intersection points
                this.ctx.fillStyle = '#218d8d';
                this.ctx.beginPath();
                this.ctx.arc(x, y1, 3, 0, 2 * Math.PI);
                this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.arc(x, y2, 3, 0, 2 * Math.PI);
                this.ctx.fill();
                
                this.constructionPoints.push({x, y1, y2, distance: dist});
                
                // Label distance
                if (index % 2 === 0) { // Label every other point to avoid clutter
                    this.ctx.fillStyle = '#626c71';
                    this.ctx.font = '10px var(--font-family-base)';
                    this.ctx.fillText(`${dist}mm`, x - 15, this.canvas.height - 30);
                }
            }
        });
    }
    
    drawHyperbola() {
        // Generate hyperbola points
        this.hyperbolaPoints = [];
        
        for (let x = this.vertex; x < this.canvas.width - 50; x += 2) {
            const distanceFromDirectrix = (x - this.directrix) / this.scale;
            if (distanceFromDirectrix > 0) {
                const radius = this.eccentricity * distanceFromDirectrix * this.scale;
                const dx = x - this.focus;
                const discriminant = radius * radius - dx * dx;
                
                if (discriminant >= 0) {
                    const dy = Math.sqrt(discriminant);
                    this.hyperbolaPoints.push({
                        x: x,
                        y1: this.axisY - dy,
                        y2: this.axisY + dy
                    });
                }
            }
        }
        
        // Draw hyperbola curves
        this.ctx.strokeStyle = '#218d8d';
        this.ctx.lineWidth = 3;
        
        // Upper branch
        this.ctx.beginPath();
        this.hyperbolaPoints.forEach((point, index) => {
            if (index === 0) {
                this.ctx.moveTo(point.x, point.y1);
            } else {
                this.ctx.lineTo(point.x, point.y1);
            }
        });
        this.ctx.stroke();
        
        // Lower branch
        this.ctx.beginPath();
        this.hyperbolaPoints.forEach((point, index) => {
            if (index === 0) {
                this.ctx.moveTo(point.x, point.y2);
            } else {
                this.ctx.lineTo(point.x, point.y2);
            }
        });
        this.ctx.stroke();
    }
    
    showTangentAndNormal() {
        const pointDistance = 50;
        const pointX = (this.directrixX + pointDistance) * this.scale;
        const radius = this.eccentricity * pointDistance * this.scale;
        const dx = pointX - this.focus;
        const dy = Math.sqrt(radius * radius - dx * dx);
        const pointY = this.axisY - dy; // Use upper branch point
        
        // Highlight the point P
        this.ctx.fillStyle = '#c01f2f';
        this.ctx.beginPath();
        this.ctx.arc(pointX, pointY, 5, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Label point P
        this.ctx.fillStyle = '#c01f2f';
        this.ctx.font = 'bold 14px var(--font-family-base)';
        this.ctx.fillText('P', pointX + 10, pointY - 10);
        
        // Draw line PF
        this.ctx.strokeStyle = 'rgba(192, 21, 47, 0.6)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([3, 3]);
        this.ctx.beginPath();
        this.ctx.moveTo(pointX, pointY);
        this.ctx.lineTo(this.focus, this.axisY);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Find point T on directrix (perpendicular from F to directrix)
        const tX = this.directrix;
        const tY = this.axisY;
        
        // Mark point T
        this.ctx.fillStyle = '#a84b2f';
        this.ctx.beginPath();
        this.ctx.arc(tX, tY, 4, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Label point T
        this.ctx.fillText('T', tX - 20, tY - 10);
        
        // Draw tangent T-P
        this.ctx.strokeStyle = '#a84b2f';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(tX, tY);
        this.ctx.lineTo(pointX, pointY);
        this.ctx.stroke();
        
        // Extend tangent line
        const tangentSlope = (pointY - tY) / (pointX - tX);
        const extendLength = 100;
        const extendX = pointX + extendLength;
        const extendY = pointY + tangentSlope * extendLength;
        
        this.ctx.strokeStyle = 'rgba(168, 75, 47, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(pointX, pointY);
        this.ctx.lineTo(extendX, extendY);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw normal (perpendicular to tangent through P)
        const normalSlope = -1 / tangentSlope;
        const normalExtend = 80;
        const normalX1 = pointX - normalExtend;
        const normalY1 = pointY - normalSlope * normalExtend;
        const normalX2 = pointX + normalExtend;
        const normalY2 = pointY + normalSlope * normalExtend;
        
        this.ctx.strokeStyle = '#5e4068';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(normalX1, normalY1);
        this.ctx.lineTo(normalX2, normalY2);
        this.ctx.stroke();
        
        // Add labels
        this.ctx.fillStyle = '#a84b2f';
        this.ctx.font = '12px var(--font-family-base)';
        this.ctx.fillText('Tangent', pointX + 20, pointY + 20);
        
        this.ctx.fillStyle = '#5e4068';
        this.ctx.fillText('Normal', pointX + 20, pointY - 30);
    }
    
    highlightConstructionPoint() {
        // Clear previous highlights by redrawing affected area
        if (this.currentStep >= 4) {
            this.redrawCanvas();
        }
        
        const x = (this.directrixX + this.currentDistance) * this.scale;
        const radius = this.eccentricity * this.currentDistance * this.scale;
        
        // Highlight construction circle
        this.ctx.strokeStyle = '#ff5459';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(this.focus, this.axisY, radius, 0, 2 * Math.PI);
        this.ctx.stroke();
        
        // Highlight vertical line
        this.ctx.strokeStyle = '#ff5459';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x, 50);
        this.ctx.lineTo(x, this.canvas.height - 50);
        this.ctx.stroke();
        
        // Calculate and highlight intersection points
        const dx = x - this.focus;
        const discriminant = radius * radius - dx * dx;
        
        if (discriminant >= 0) {
            const dy = Math.sqrt(discriminant);
            const y1 = this.axisY - dy;
            const y2 = this.axisY + dy;
            
            // Highlight intersection points
            this.ctx.fillStyle = '#ff5459';
            this.ctx.beginPath();
            this.ctx.arc(x, y1, 5, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(x, y2, 5, 0, 2 * Math.PI);
            this.ctx.fill();
        }
    }
    
    redrawCanvas() {
        this.initializeCanvas();
        
        // Redraw completed steps
        this.completedSteps.forEach(step => {
            switch(step) {
                case 1: this.drawDirectrixAndAxis(); break;
                case 2: this.drawVertexAndFocus(); break;
                case 3: this.calculateEccentricity(); break;
                case 4: this.addConstructionPoints(); break;
                case 5: this.drawHyperbola(); break;
                case 6: this.showTangentAndNormal(); break;
            }
        });
    }
    
    updateCalculations() {
        const radius = this.eccentricity * this.currentDistance;
        const pfDistance = radius;
        const pdDistance = this.currentDistance;
        const ratio = pfDistance / pdDistance;
        
        document.getElementById('distanceValue').textContent = this.currentDistance;
        document.getElementById('radiusCalc').textContent = `R = (5/3) × ${this.currentDistance} = ${radius.toFixed(1)} mm`;
        document.getElementById('pfDistance').textContent = `${pfDistance.toFixed(1)} mm`;
        document.getElementById('pdDistance').textContent = `${pdDistance.toFixed(1)} mm`;
        document.getElementById('ratio').textContent = ratio.toFixed(3);
    }
    
    updateStepInfo(step) {
        const stepInfo = document.getElementById('stepInfo');
        const stepTitles = [
            '',
            'Step 1: Directrix and Axis',
            'Step 2: Vertex and Focus',
            'Step 3: Eccentricity Calculation', 
            'Step 4: Construction Points',
            'Step 5: Hyperbola Curve',
            'Step 6: Tangent and Normal'
        ];
        
        const stepDescriptions = [
            '',
            'The vertical red line D-D\' is the directrix, and the horizontal black line A-A\' is the axis of symmetry. These form the foundation for our hyperbola construction.',
            'The vertex V is placed 15mm from the directrix, and the focus F is placed 40mm from the directrix. These points define the key parameters of our hyperbola.',
            'The eccentricity e = VF/VD = 25/15 = 5/3 ≈ 1.667. Since e > 1, this confirms we have a hyperbola. For any point P on the curve, PF/PD = e.',
            'Construction points are created by drawing vertical lines at various distances from the directrix, then finding intersections with circles centered at F with radius R = e × distance.',
            'The hyperbola curve is drawn by connecting all the construction points. Notice how the curve approaches asymptotes and has two branches symmetric about the axis.',
            'At point P (50mm from directrix), the tangent is drawn by connecting T (foot of perpendicular from F to directrix) to P. The normal passes through P perpendicular to the tangent.'
        ];
        
        stepInfo.innerHTML = `
            <h4>${stepTitles[step]}</h4>
            <p>${stepDescriptions[step]}</p>
            <div class="formula-box">
                <strong>Current Values:</strong><br>
                Vertex Distance: 15mm | Focus Distance: 40mm<br>
                Eccentricity: e = 5/3 ≈ 1.667<br>
                Construction Point: ${this.currentDistance}mm | Radius: ${(this.eccentricity * this.currentDistance).toFixed(1)}mm
            </div>
        `;
    }
    
    reset() {
        this.currentStep = 0;
        this.completedSteps = [];
        this.constructionPoints = [];
        this.hyperbolaPoints = [];
        
        // Reset button states
        for (let i = 1; i <= 6; i++) {
            const btn = document.getElementById(`step${i}`);
            btn.disabled = i !== 1;
            btn.classList.remove('btn--secondary', 'step-active');
            if (i === 1) {
                btn.classList.add('btn--primary');
            }
        }
        
        // Clear canvas
        this.initializeCanvas();
        
        // Reset info
        this.updateStepInfo(0);
        this.updateCalculations();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const constructor = new HyperbolaConstructor();
    
    // Initialize calculations display
    constructor.updateCalculations();
});