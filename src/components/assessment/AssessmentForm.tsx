import React, { useState } from 'react';
import { CheckCircle, Clock, User } from 'lucide-react';
import Badge from '../common/Badge';

interface Question {
  id: string;
  text: string;
  type: 'scale' | 'text';
  required: boolean;
}

interface AssessmentFormProps {
  competencyName: string;
  questions: Question[];
  onSubmit: (answers: Record<string, any>) => void;
  onCancel: () => void;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({
  competencyName,
  questions,
  onSubmit,
  onCancel
}) => {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    // Validate all required questions are answered
    const requiredQuestions = questions.filter(q => q.required);
    const unansweredRequired = requiredQuestions.filter(q => !answers[q.id]);
    
    if (unansweredRequired.length > 0) {
      alert('Por favor, responda todas as questões obrigatórias.');
      return;
    }
    
    onSubmit(answers);
  };

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;
  const hasAnswer = answers[question.id] !== undefined;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <User className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-900">Avaliação de Competência</h2>
          </div>
          <p className="text-gray-600 mb-4">{competencyName}</p>
          
          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Progresso</span>
              <span className="text-gray-900 font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          <p className="text-sm text-gray-500">
            Questão {currentQuestion + 1} de {questions.length}
          </p>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {question.text}
          </h3>

          {question.type === 'scale' ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Avalie de 1 (Discordo totalmente) a 10 (Concordo totalmente)
              </p>
              <div className="grid grid-cols-10 gap-2">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
                  <button
                    key={value}
                    onClick={() => handleAnswer(question.id, value)}
                    className={`h-12 rounded-lg border-2 font-medium transition-all ${
                      answers[question.id] === value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Discordo totalmente</span>
                <span>Concordo totalmente</span>
              </div>
            </div>
          ) : (
            <textarea
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              placeholder="Digite sua resposta..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>

          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            
            {isLastQuestion ? (
              <button
                onClick={handleSubmit}
                disabled={!hasAnswer}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Finalizar Avaliação
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!hasAnswer}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Próxima
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentForm;