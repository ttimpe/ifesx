import { Component, OnInit, ViewChild } from '@angular/core';
import { TreeTable, TreeTableModule } from 'primeng/treetable';
import { TreeNode } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrash, faPlus, faCircleH, faFolder, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons'
import { StopService } from '../../services/stop.service';
import { CalendarService } from '../../services/calendar.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-stop-list',
  templateUrl: './stop-list.component.html',
  styleUrls: ['./stop-list.component.css'],
  standalone: true,
  imports: [CommonModule, TreeTableModule, FontAwesomeModule, ButtonModule, InputText]
})
export class StopListComponent implements OnInit {
  nodes: TreeNode[] = [];
  selectedNode: TreeNode | null = null;
  faTrash = faTrash;
  faPlus = faPlus;
  faCircleH = faCircleH;
  faFolder = faFolder;
  faMapMarkerAlt = faMapMarkerAlt;

  selectedBasisVersion: number | undefined;
  loading: boolean = true;

  @ViewChild('tt') tt: TreeTable | undefined;

  constructor(private stopService: StopService, private router: Router, private calendarService: CalendarService) { }

  ngOnInit(): void {
    this.calendarService.selectedVersion$.subscribe(version => {
      this.selectedBasisVersion = version || undefined;
      this.loadStops();
    });
  }

  loadStops() {
    this.loading = true;
    this.stopService.getAllRecOrts('', this.selectedBasisVersion).subscribe((data: any[]) => {
      this.nodes = this.buildTree(data);
      this.loading = false;
    });
  }

  buildTree(data: any[]): TreeNode[] {
    const groups = new Map<number, any[]>();
    const rootNodes: TreeNode[] = [];

    // Group by ORT_REF_ORT
    const orphans: any[] = [];

    data.forEach(stop => {
      const parentId = stop.ORT_REF_ORT;
      if (parentId && parentId > 0) {
        if (!groups.has(parentId)) {
          groups.set(parentId, []);
        }
        groups.get(parentId)!.push(stop);
      } else {
        orphans.push(stop);
      }
    });

    // Create Group Nodes
    groups.forEach((children, parentId) => {
      // Use the ORT_REF_ORT_NAME from the first child as the Group Name
      const groupName = children[0].ORT_REF_ORT_NAME || 'Unbekannte Gruppe';
      const groupCode = children[0].ORT_REF_ORT_KUERZEL || '';
      // Use the ORT_REF_ORT_LangNr as the "Original ID" to show in the tree
      const groupOriginalId = children[0].ORT_REF_ORT_LangNr || parentId;

      const childrenNodes: TreeNode[] = children.map(child => ({
        data: {
          name: child.ORT_NAME,
          nr: child.ORT_NR,
          code: child.ORT_REF_ORT_KUERZEL,
          type: 'stop',
          onrTyp: child.ONR_TYP_NR, // Add to data
          raw: child,
          originalId: child.ORT_REF_ORT_LangNr // Add original ID to child data too if needed
        },
        leaf: true,
        key: String(child.ORT_NR)
      }));

      // Sort children by name (natural sort)
      childrenNodes.sort((a, b) => a.data.name.localeCompare(b.data.name, undefined, { numeric: true }));

      rootNodes.push({
        data: {
          name: groupName,
          nr: groupOriginalId, // Show the Original ID (e.g. 5081) here!
          code: groupCode,
          type: 'group',
          count: children.length
        },
        children: childrenNodes,
        expanded: false,
        key: 'G-' + parentId,
        leaf: false
      });
    });

    // Sort Groups by Name (natural sort)
    rootNodes.sort((a, b) => a.data.name.localeCompare(b.data.name, undefined, { numeric: true }));

    // Add orphans at the bottom or top?
    const orphanNodes: TreeNode[] = orphans.map(child => ({
      data: {
        name: child.ORT_NAME,
        nr: child.ORT_NR,
        code: child.ORT_REF_ORT_KUERZEL,
        type: 'stop',
        onrTyp: child.ONR_TYP_NR, // Add to data
        raw: child
      },
      leaf: true,
      key: String(child.ORT_NR)
    }));
    orphanNodes.sort((a, b) => a.data.name.localeCompare(b.data.name, undefined, { numeric: true }));

    return [...rootNodes, ...orphanNodes];
  }

  applyFilterGlobal($event: any) {
    this.tt!.filterGlobal(($event.target as HTMLInputElement).value, 'contains');
  }

  addStop() {
    this.router.navigate(['/stops/add']);
  }

  editStop(rowNode: any) {
    // PrimeNG TreeTable: rowNode = {node: TreeNode, parent: ..., level: ...}
    const treeNode = rowNode.node;
    const data = treeNode.data;

    if (data.type === 'group') {
      // Handle Group Edit
      const parentId = treeNode.key.replace('G-', '');
      this.router.navigate(['/stops/group'], {
        queryParams: {
          refId: parentId,
          basisVersion: treeNode.children && treeNode.children.length > 0 ? treeNode.children[0].data.raw.BASIS_VERSION : 1
        }
      });
      return;
    }

    if (data.type !== 'stop') return;
    const stop = data.raw;
    this.router.navigate(['/stops/' + stop.ORT_NR], {
      queryParams: {
        basisVersion: stop.BASIS_VERSION,
        onrTypNr: stop.ONR_TYP_NR
      }
    });
  }

  deleteStop(rowNode: any) {
    const treeNode = rowNode.node;
    const data = treeNode.data;
    if (data.type !== 'stop') return;
    const stop = data.raw;

    if (!confirm(`Haltestelle "${stop.ORT_NAME}" (${stop.ORT_NR}) wirklich löschen?`)) {
      return;
    }

    this.stopService.deleteRecOrt(stop.ORT_NR).subscribe({
      next: () => {
        this.loadStops();
      },
      error: (err: any) => {
        console.error('Failed to delete stop:', err);
        alert('Fehler beim Löschen der Haltestelle');
      }
    });
  }

  countStops(acc: number, node: TreeNode): number {
    if (node.children) {
      return acc + node.children.length;
    }
    return acc + (node.leaf ? 1 : 0);
  }

  getOnrTypeLabel(typ?: number): string {
    switch (typ) {
      case 1: return 'Haltepunkt';
      case 2: return 'Betriebshofpunkt';
      case 3: return 'Ortsmarke';
      case 4: return 'LSA-Punkt';
      default: return typ ? String(typ) : '-';
    }
  }
}
