import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, TrendingUp, Plus, Trash2, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

interface Grade {
  id: string;
  subject: string;
  grade: number; // 0.0 - 4.0
  semester: string;
  userId: string;
}

export default function GPATracker() {
  const { user } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [newGrade, setNewGrade] = useState('4.0');
  const [newSemester, setNewSemester] = useState('Fall 2025');
  const svgRef = useRef<SVGSVGElement>(null);

  const fetchGrades = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/grades', {
        headers: { 'x-user-id': user.uid }
      });
      if (res.ok) {
        setGrades(await res.json());
      }
    } catch (error) {
      console.error("Error fetching grades:", error);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, [user]);

  useEffect(() => {
    if (grades.length > 0 && svgRef.current) {
      renderChart();
    }
  }, [grades]);

  const renderChart = () => {
    const data = grades.sort((a, b) => a.semester.localeCompare(b.semester));
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 600 300`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scalePoint()
      .domain(data.map(d => d.semester))
      .range([0, width])
      .padding(0.5);

    const y = d3.scaleLinear()
      .domain([0, 4.0])
      .range([height, 0]);

    // Grid lines
    svg.append("g")
      .attr("class", "grid")
      .attr("opacity", 0.1)
      .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(() => ""));

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("font-size", "10px")
      .style("font-weight", "bold");

    svg.append("g")
      .call(d3.axisLeft(y).ticks(5))
      .selectAll("text")
      .style("font-size", "10px");

    // Line
    const line = d3.line<Grade>()
      .x(d => x(d.semester) || 0)
      .y(d => y(d.grade))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "hsl(var(--primary))")
      .attr("stroke-width", 3)
      .attr("d", line);

    // Dots
    svg.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.semester) || 0)
      .attr("cy", d => y(d.grade))
      .attr("r", 5)
      .attr("fill", "white")
      .attr("stroke", "hsl(var(--primary))")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", function() {
        d3.select(this).transition().duration(200).attr("r", 8);
      })
      .on("mouseout", function() {
        d3.select(this).transition().duration(200).attr("r", 5);
      });
  };

  const handleAddGrade = async () => {
    if (!user) return;
    if (!newSubject.trim()) {
      toast.error('Subject is required');
      return;
    }

    try {
      const res = await fetch('/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.uid },
        body: JSON.stringify({
          subject: newSubject,
          grade: parseFloat(newGrade),
          semester: newSemester,
          userId: user.uid
        })
      });

      if (res.ok) {
        setNewSubject('');
        toast.success('Grade added to tracker');
        fetchGrades();
      }
    } catch (error) {
      console.error("Error adding grade:", error);
    }
  };

  const deleteGrade = async (id: string) => {
    try {
      const res = await fetch(`/api/grades/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Grade removed');
        fetchGrades();
      }
    } catch (error) {
      console.error("Error deleting grade:", error);
    }
  };

  const calculateGPA = () => {
    if (grades.length === 0) return "0.00";
    const sum = grades.reduce((acc, curr) => acc + curr.grade, 0);
    return (sum / grades.length).toFixed(2);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <GraduationCap className="w-10 h-10 text-primary" />
            GPA Tracker
          </h1>
          <p className="text-muted-foreground font-medium mt-1">Visualize and track your academic performance.</p>
        </div>
        <div className="bg-primary/10 px-6 py-3 rounded-2xl flex items-center gap-3 border border-primary/20">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Current GPA:</span>
          <span className="text-2xl font-black text-primary">{calculateGPA()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-4 glass border-none rounded-3xl overflow-hidden self-start">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-black">Add New Record</CardTitle>
            <CardDescription>Log your grades for each subject.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Subject</label>
              <Input 
                placeholder="e.g. Mathematics" 
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="py-6 bg-background/50 border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Grade (4.0 Scale)</label>
                <Select value={newGrade} onValueChange={setNewGrade}>
                  <SelectTrigger className="py-6 bg-background/50 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['4.0', '3.7', '3.3', '3.0', '2.7', '2.3', '2.0', '1.7', '1.3', '1.0', '0.0'].map(g => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Semester</label>
                <Select value={newSemester} onValueChange={setNewSemester}>
                  <SelectTrigger className="py-6 bg-background/50 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['Fall 2025', 'Spring 2026', 'Fall 2026', 'Spring 2027'].map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full py-6 rounded-xl font-bold shadow-lg shadow-primary/20 mt-4 active:scale-95 transition-all" onClick={handleAddGrade}>
              <Plus className="w-4 h-4 mr-2" />
              Add to Tracker
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-8 space-y-6">
          <Card className="glass border-none rounded-3xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-black">Performance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {grades.length > 0 ? (
                <div className="w-full bg-background/30 rounded-2xl p-4">
                  <svg ref={svgRef} className="w-full h-auto" />
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted rounded-2xl text-muted-foreground font-medium italic">
                  Add some grades to see your trend
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {grades.map((grade) => (
              <motion.div
                key={grade.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="group"
              >
                <div className="glass p-4 rounded-2xl flex items-center justify-between border border-transparent group-hover:border-primary/20 transition-all shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Award className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{grade.subject}</h4>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{grade.semester}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-black text-primary">{grade.grade.toFixed(1)}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10" onClick={() => deleteGrade(grade.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
