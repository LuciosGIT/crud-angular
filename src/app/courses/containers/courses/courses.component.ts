import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { catchError, Observable, of, tap } from 'rxjs';

import { ErrorDialogComponent } from '../../../shared/components/error-dialog/error-dialog.component';
import { Course } from '../../model/course';
import { CoursesService } from '../../services/courses.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { CoursePage } from '../../model/course-page';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss'
})
export class CoursesComponent implements OnInit {

  courses$: Observable<CoursePage> | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  pageIndex = 0;
  pageSize = 10;


  constructor(private coursesService: CoursesService,
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  )  {
    this.refresh();
}

  refresh(pageEvent: PageEvent = {length: 0, pageIndex: 0, pageSize: 10}) {
    this.courses$ = this.coursesService.list(pageEvent.pageIndex, pageEvent.pageSize).pipe(
      tap( () => {
        this.pageIndex = pageEvent.pageIndex;
        this.pageSize = pageEvent.pageSize;
      }),
      catchError(error => {
        this.onError('Erro ao carregar cursos.');
        return of({courses: [], totalElements: 0, totalPages: 0})
      })
    );
  }

  onError(errorMsg: string) {
    this.dialog.open(ErrorDialogComponent, {
      data: errorMsg
    });
  }

  ngOnInit(): void  {

  }

  onAdd() {
    this.router.navigate(['new'], {relativeTo: this.route});
  }

  onEdit(course: Course) {
    this.router.navigate(['edit', course._id], {relativeTo: this.route});
  }

  onRemove(course: Course) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: 'Tem certeza que deseja remover esse curso?',
    });

    dialogRef.afterClosed().subscribe({
      next: (result: boolean) => {

        if (result) {

          this.coursesService.remove(course._id).subscribe({
            next: () => {
              this.refresh();
              this.snackBar.open("Curso removido com sucesso!", 'X', { duration: 5000 ,
                verticalPosition: 'top',
                horizontalPosition: 'center',},
              )
            },

            error: () => this.onError('Erro ao tentar remover curso!'),
        });
        }
      }
    });


  }
}
