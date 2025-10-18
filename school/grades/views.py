from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .models import Grade
from .forms import GradeForm

@login_required
def grade_list(request):
    grades = Grade.objects.all()
    return render(request, 'grades/grade_list.html', {'grades': grades})

@login_required
def grade_detail(request, pk):
    grade = get_object_or_404(Grade, pk=pk)
    return render(request, 'grades/grade_detail.html', {'grade': grade})

@login_required
def grade_create(request):
    if request.method == 'POST':
        form = GradeForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Grade created successfully.')
            return redirect('grades:grade_list')
    else:
        form = GradeForm()
    return render(request, 'grades/grade_form.html', {'form': form, 'title': 'Create Grade'})

@login_required
def grade_update(request, pk):
    grade = get_object_or_404(Grade, pk=pk)
    if request.method == 'POST':
        form = GradeForm(request.POST, instance=grade)
        if form.is_valid():
            form.save()
            messages.success(request, 'Grade updated successfully.')
            return redirect('grades:grade_detail', pk=grade.pk)
    else:
        form = GradeForm(instance=grade)
    return render(request, 'grades/grade_form.html', {'form': form, 'title': 'Edit Grade'})

@login_required
def grade_delete(request, pk):
    grade = get_object_or_404(Grade, pk=pk)
    if request.method == 'POST':
        grade.delete()
        messages.success(request, 'Grade deleted successfully.')
        return redirect('grades:grade_list')
    return render(request, 'grades/grade_confirm_delete.html', {'grade': grade})
