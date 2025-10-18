from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .models import Class
from .forms import ClassForm

def class_list(request):
    classes = Class.objects.all()
    return render(request, 'classes/class_list.html', {'classes': classes})

@login_required
def class_detail(request, pk):
    class_obj = get_object_or_404(Class, pk=pk)
    return render(request, 'classes/class_detail.html', {'class_obj': class_obj})

@login_required
def class_create(request):
    if request.method == 'POST':
        form = ClassForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Class created successfully.')
            return redirect('classes:class_list')
    else:
        form = ClassForm()
    return render(request, 'classes/class_form.html', {'form': form, 'title': 'Create Class'})

@login_required
def class_update(request, pk):
    class_obj = get_object_or_404(Class, pk=pk)
    if request.method == 'POST':
        form = ClassForm(request.POST, instance=class_obj)
        if form.is_valid():
            form.save()
            messages.success(request, 'Class updated successfully.')
            return redirect('classes:class_detail', pk=class_obj.pk)
    else:
        form = ClassForm(instance=class_obj)
    return render(request, 'classes/class_form.html', {'form': form, 'title': 'Edit Class'})

@login_required
def class_delete(request, pk):
    class_obj = get_object_or_404(Class, pk=pk)
    if request.method == 'POST':
        class_obj.delete()
        messages.success(request, 'Class deleted successfully.')
        return redirect('classes:class_list')
    return render(request, 'classes/class_confirm_delete.html', {'class_obj': class_obj})
